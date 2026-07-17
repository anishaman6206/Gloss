import "server-only";
import { prisma } from "./prisma";

export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function computeStreak(counts: Map<string, number>): number {
  let streak = 0;
  const cursor = new Date();
  if (!counts.get(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (counts.get(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Shared by /stats and the extension-facing summary API so "what counts as
// an active day" (including Pro streak-freezes) never drifts between them.
export async function getReviewCounts(
  userId: string,
  windowDays: number
): Promise<Map<string, number>> {
  const since = new Date();
  since.setDate(since.getDate() - (windowDays - 1));
  since.setHours(0, 0, 0, 0);

  const [logs, freezes] = await Promise.all([
    prisma.reviewLog.findMany({
      where: { userId, reviewedAt: { gte: since } },
      select: { reviewedAt: true },
    }),
    prisma.streakFreeze.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { dateKey: true },
    }),
  ]);

  const counts = new Map<string, number>();
  for (const log of logs) {
    const key = dateKey(log.reviewedAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  for (const freeze of freezes) {
    counts.set(freeze.dateKey, (counts.get(freeze.dateKey) ?? 0) + 1);
  }
  return counts;
}
