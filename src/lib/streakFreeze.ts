import "server-only";
import { prisma } from "./prisma";
import { subscriptionStatus } from "./auth";
import { dateKey } from "./stats";

const FREEZE_CAP = 4;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

type FreezeUser = {
  id: string;
  createdAt: Date;
  streakFreezesAvailable: number;
  streakFreezesRefreshedAt: Date | null;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

export function freezesOwed(
  user: { streakFreezesRefreshedAt: Date | null; createdAt: Date },
  now = new Date()
): number {
  const since = user.streakFreezesRefreshedAt ?? user.createdAt;
  const elapsedWeeks = Math.floor((now.getTime() - since.getTime()) / MS_PER_WEEK);
  return Math.max(0, Math.min(FREEZE_CAP, elapsedWeeks));
}

// Lazy weekly refill on read, same "derived on read" philosophy computeStreak
// already uses elsewhere. Trial users don't accrue freezes.
export async function ensureFreezesRefilled(userId: string): Promise<FreezeUser> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const sub = subscriptionStatus(user);
  if (!sub.isPaid) return user;

  const owed = freezesOwed(user);
  if (owed === 0) return user;

  return prisma.user.update({
    where: { id: userId },
    data: {
      streakFreezesAvailable: Math.min(FREEZE_CAP, user.streakFreezesAvailable + owed),
      streakFreezesRefreshedAt: new Date(),
    },
  });
}

// Auto-forgives a single missed day: if yesterday broke a streak that was
// genuinely running (the day before it was active) and a freeze is
// available, silently spends one so a user doesn't lose the streak just for
// not opening the app in time. Only ever patches the single most-recent gap
// day — it does not resurrect older, multi-day gaps.
export async function autoApplyFreezeIfNeeded(
  userId: string,
  counts: Map<string, number>
): Promise<{ user: FreezeUser; appliedDateKey: string | null }> {
  const refilled = await ensureFreezesRefilled(userId);
  const sub = subscriptionStatus(refilled);
  if (!sub.isPaid || refilled.streakFreezesAvailable <= 0) {
    return { user: refilled, appliedDateKey: null };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBefore = new Date();
  dayBefore.setDate(dayBefore.getDate() - 2);
  const yesterdayKey = dateKey(yesterday);
  const dayBeforeKey = dateKey(dayBefore);

  const yesterdayIsGap = !counts.get(yesterdayKey);
  const streakWasRunning = !!counts.get(dayBeforeKey);
  if (!yesterdayIsGap || !streakWasRunning) {
    return { user: refilled, appliedDateKey: null };
  }

  try {
    const [, updated] = await prisma.$transaction([
      prisma.streakFreeze.create({ data: { userId, dateKey: yesterdayKey } }),
      prisma.user.update({
        where: { id: userId },
        data: { streakFreezesAvailable: { decrement: 1 } },
      }),
    ]);
    return { user: updated, appliedDateKey: yesterdayKey };
  } catch {
    // Unique constraint hit (already frozen) — nothing to do.
    return { user: refilled, appliedDateKey: null };
  }
}
