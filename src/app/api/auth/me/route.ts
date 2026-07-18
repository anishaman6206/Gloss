import { NextResponse } from "next/server";
import { getCurrentUser, subscriptionStatus } from "@/lib/auth";
import { computeStreak, getReviewCounts } from "@/lib/stats";

// Same 14-day lookback the /stats page uses, so the header badge and the
// stats page never disagree on the streak number.
const STREAK_WINDOW_DAYS = 14;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const counts = await getReviewCounts(user.id, STREAK_WINDOW_DAYS);

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
    subscription: subscriptionStatus(user),
    streak: computeStreak(counts),
  });
}
