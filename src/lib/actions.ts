"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { applySm2 } from "./sm2";
import type { Definition, ReviewQuality } from "./types";

export async function saveWord(input: { phrase: string; sentence: string } & Definition) {
  await prisma.word.create({
    data: {
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
}

export async function gradeReview(wordId: string, quality: ReviewQuality) {
  const review = await prisma.review.findUnique({ where: { wordId } });
  if (!review) return;

  const result = applySm2(
    {
      easeFactor: review.easeFactor,
      intervalDays: review.intervalDays,
      repetitions: review.repetitions,
      lapses: review.lapses,
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
      data: { wordId, quality },
    }),
  ]);

  revalidatePath("/review");
  revalidatePath("/library");
  revalidatePath("/stats");
}
