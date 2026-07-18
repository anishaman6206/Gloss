"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { applySm2 } from "./sm2";
import { getCurrentUser, requireUser, subscriptionStatus } from "./auth";
import type { Definition, ReviewQuality } from "./types";

export async function saveWord(
  input: { phrase: string; sentence: string; source?: string } & Definition
) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: "unauthorized" };
  }
  const sub = subscriptionStatus(user);
  if (!sub.isActive) {
    return { ok: false as const, error: "subscription_required" };
  }

  const existing = await prisma.word.findFirst({
    where: { userId: user.id, phrase: { equals: input.phrase, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    return { ok: true as const, wordId: existing.id, alreadyExisted: true as const };
  }

  const word = await prisma.word.create({
    data: {
      userId: user.id,
      phrase: input.phrase,
      sentence: input.sentence,
      definition: input.definition,
      partOfSpeech: input.partOfSpeech,
      synonyms: JSON.stringify(input.synonyms),
      examples: JSON.stringify(input.examples),
      source: input.source ?? "scan",
      review: { create: {} },
    },
    select: { id: true },
  });

  revalidatePath("/library");
  revalidatePath("/review");
  return { ok: true as const, wordId: word.id, alreadyExisted: false as const };
}

export async function deleteWord(wordId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: "unauthorized" };
  }

  // deleteMany (rather than delete) folds the ownership check into the
  // query itself: a wordId belonging to someone else just matches zero rows.
  const { count } = await prisma.word.deleteMany({
    where: { id: wordId, userId: user.id },
  });
  if (count === 0) {
    return { ok: false as const, error: "not_found" };
  }

  revalidatePath("/library");
  revalidatePath("/review");
  revalidatePath("/stats");
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
