import { NextResponse } from "next/server";
import { requireUser, subscriptionStatus } from "@/lib/auth";
import { cancelSubscription } from "@/lib/subscription";

export async function POST() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const sub = subscriptionStatus(user);
  if (!sub.isPaid) {
    return NextResponse.json({ ok: false, error: "no_active_subscription" }, { status: 400 });
  }

  const updated = await cancelSubscription(user.id);

  return NextResponse.json({
    ok: true,
    currentPeriodEnd: updated.currentPeriodEnd,
  });
}
