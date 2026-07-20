"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { applySm2, LEARNED_INTERVAL_DAYS } from "./sm2";
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

export async function updateWord(wordId: string, input: { tags?: string[]; notes?: string }) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: "unauthorized" };
  }

  const data: { tags?: string; notes?: string } = {};
  if (input.tags !== undefined) data.tags = JSON.stringify(input.tags);
  if (input.notes !== undefined) data.notes = input.notes;

  const { count } = await prisma.word.updateMany({
    where: { id: wordId, userId: user.id },
    data,
  });
  if (count === 0) {
    return { ok: false as const, error: "not_found" };
  }

  revalidatePath("/library");
  return { ok: true as const };
}

export async function bulkDeleteWords(wordIds: string[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: "unauthorized" };
  }
  if (wordIds.length === 0) return { ok: true as const, count: 0 };

  const { count } = await prisma.word.deleteMany({
    where: { id: { in: wordIds }, userId: user.id },
  });

  revalidatePath("/library");
  revalidatePath("/review");
  revalidatePath("/stats");
  return { ok: true as const, count };
}

// No atomic JSON-array-append exists for a plain String column, so this
// reads each owned row's current tags, appends (de-duped), and writes them
// back in a transaction.
export async function bulkAddTag(wordIds: string[], tag: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: "unauthorized" };
  }
  const trimmed = tag.trim();
  if (!trimmed || wordIds.length === 0) return { ok: true as const, count: 0 };

  const words = await prisma.word.findMany({
    where: { id: { in: wordIds }, userId: user.id },
    select: { id: true, tags: true },
  });

  const updates = words.map((w) => {
    const existing: string[] = JSON.parse(w.tags);
    const next = existing.includes(trimmed) ? existing : [...existing, trimmed];
    return prisma.word.update({ where: { id: w.id }, data: { tags: JSON.stringify(next) } });
  });
  await prisma.$transaction(updates);

  revalidatePath("/library");
  return { ok: true as const, count: words.length };
}

// "Move to Review" bulk action and single-row "Review Now" (call with a
// 1-element array) - makes the word(s) due immediately. Review has no
// userId column, so ownership is enforced through the word relation filter.
export async function bulkSetDueNow(wordIds: string[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: "unauthorized" };
  }
  if (wordIds.length === 0) return { ok: true as const, count: 0 };

  const { count } = await prisma.review.updateMany({
    where: { wordId: { in: wordIds }, word: { userId: user.id } },
    data: { nextReviewAt: new Date() },
  });

  revalidatePath("/review");
  revalidatePath("/library");
  return { ok: true as const, count };
}

// "Change Status" bulk action, reinterpreted as two explicit actions since
// status is derived from SM-2 state, not a freely settable field.
export async function bulkMarkLearned(wordIds: string[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: "unauthorized" };
  }
  if (wordIds.length === 0) return { ok: true as const, count: 0 };

  const nextReviewAt = new Date(Date.now() + LEARNED_INTERVAL_DAYS * 86_400_000);
  const { count } = await prisma.review.updateMany({
    where: { wordId: { in: wordIds }, word: { userId: user.id } },
    data: { intervalDays: LEARNED_INTERVAL_DAYS, repetitions: 5, nextReviewAt },
  });

  revalidatePath("/review");
  revalidatePath("/library");
  revalidatePath("/stats");
  return { ok: true as const, count };
}

export async function bulkResetProgress(wordIds: string[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: "unauthorized" };
  }
  if (wordIds.length === 0) return { ok: true as const, count: 0 };

  const { count } = await prisma.review.updateMany({
    where: { wordId: { in: wordIds }, word: { userId: user.id } },
    data: {
      easeFactor: 2.5,
      intervalDays: 0,
      repetitions: 0,
      lapses: 0,
      nextReviewAt: new Date(),
      lastReviewedAt: null,
    },
  });

  revalidatePath("/review");
  revalidatePath("/library");
  revalidatePath("/stats");
  return { ok: true as const, count };
}
