import type { ReviewQuality, WordStatus } from "./types";

export type Sm2State = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
};

export type Sm2Result = Sm2State & {
  nextReviewAt: Date;
};

const MIN_EASE_FACTOR = 1.3;

// Standard SM-2 (Piotr Woźniak). `quality` is 0-5: <3 is a lapse.
export function applySm2(state: Sm2State, quality: ReviewQuality, now = new Date()): Sm2Result {
  let { easeFactor, intervalDays, repetitions, lapses } = state;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
    lapses += 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, lapses, nextReviewAt };
}

const LEARNED_INTERVAL_DAYS = 21;

export function wordStatus(review: { repetitions: number; intervalDays: number } | null): WordStatus {
  if (!review || review.repetitions === 0) return "new";
  if (review.intervalDays >= LEARNED_INTERVAL_DAYS) return "learned";
  return "learning";
}

const LEECH_THRESHOLD = 4;

export function isLeech(review: { lapses: number } | null): boolean {
  return !!review && review.lapses >= LEECH_THRESHOLD;
}
