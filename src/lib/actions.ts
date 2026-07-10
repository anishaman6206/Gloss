"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { applySm2 } from "./sm2";
import { requireUser, subscriptionStatus } from "./auth";
import type { Definition, ReviewQuality } from "./types";

export async function saveWord(input: { phrase: string; sentence: string } & Definition) {
  const user = await requireUser();
  const sub = subscriptionStatus(user);
  if (!sub.isActive) {
    return { ok: false as const, error: "subscription_required" };
  }

  await prisma.word.create({
    data: {
      userId: user.id,
      phrase: input.phrase,
      sentence: input.sentence,
      definition: input.definition,
      partOfSpeech: input.partOfSpeech,
      synonyms: JSON.stringify(input.synonyms),
      examples: JSON.stringify(input.examples),
      review: { create: {} },
    },
  });

  revalidatePath("/library");
  revalidatePath("/review");
  return { ok: true as const };
}

export async function gradeReview(wordId: string, quality: ReviewQuality) {
  const user = await requireUser();
  const sub = subscriptionStatus(user);
  if (!sub.isActive) {
    return { ok: false as const, error: "subscription_required" };
  }

  const word = await prisma.word.findFirst({
    where: { id: wordId, userId: user.id },
    include: { review: true },
  });
  if (!word || !word.review) return { ok: false as const, error: "not_found" };

  const result = applySm2(
    {
      easeFactor: word.review.easeFactor,
      intervalDays: word.review.intervalDays,
      repetitions: word.review.repetitions,
      lapses: word.review.lapses,
    },
    quality
  );

  await prisma.$transaction([
    prisma.review.update({
      where: { wordId },
      data: {
        easeFactor: result.easeFactor,
        intervalDays: result.intervalDays,
        repetitions: result.repetitions,
        lapses: result.lapses,
        nextReviewAt: result.nextReviewAt,
        lastReviewedAt: new Date(),
      },
    }),
    prisma.reviewLog.create({
      data: { wordId, quality, userId: user.id },
    }),
  ]);

  revalidatePath("/review");
  revalidatePath("/library");
  revalidatePath("/stats");
  return { ok: true as const };
}
