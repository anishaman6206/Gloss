import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computeStreak, getReviewCounts } from "@/lib/stats";

// Matches the window used on the /stats page, so the two surfaces agree.
const STREAK_WINDOW_DAYS = 14;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const counts = await getReviewCounts(user.id, STREAK_WINDOW_DAYS);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [wordsToday, totalWords] = await Promise.all([
    prisma.word.count({ where: { userId: user.id, createdAt: { gte: startOfDay } } }),
    prisma.word.count({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({
    ok: true,
    streak: computeStreak(counts),
    wordsToday,
    totalWords,
  });
}
