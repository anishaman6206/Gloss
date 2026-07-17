import "server-only";
import { prisma } from "./prisma";
import { PLANS, type PlanKey } from "./cashfree/client";

// Shared by both the return-URL handler and the webhook — the two places a
// payment can be confirmed. Extends from max(now, currentPeriodEnd) so
// re-purchases (including resubscribes after expiry) stack cleanly, and
// always clears any pending cancellation since a fresh payment supersedes it.
export async function activateSubscription({
  userId,
  plan,
  cashfreeOrderId,
  cashfreePaymentId,
  paymentMethod,
}: {
  userId: string;
  plan: PlanKey;
  cashfreeOrderId: string;
  cashfreePaymentId?: string | null;
  paymentMethod?: string | null;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const meta = PLANS[plan];
  const now = new Date();
  const base =
    user.currentPeriodEnd && user.currentPeriodEnd > now ? user.currentPeriodEnd : now;
  const currentPeriodEnd = new Date(base);
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + meta.durationDays);

  // A fresh period start only resets if the user wasn't already mid-period
  // (i.e. this is a first purchase or a resubscribe after lapsing/cancelling).
  const isFreshPeriod = base === now;

  return prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "active",
      planId: plan,
      currentPeriodEnd,
      subscriptionStart: isFreshPeriod ? now : user.subscriptionStart ?? now,
      cashfreeOrderId,
      cashfreePaymentId: cashfreePaymentId ?? undefined,
      paymentStatus: "PAID",
      paymentMethod: paymentMethod ?? undefined,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
    },
  });
}

// App-side-only cancellation: there is no auto-charging Cashfree subscription
// to cancel (each period is a one-time order, mirroring the prior Razorpay
// Orders-only design), so "cancelling" just stops the user from being nudged
// to renew and flips the display status — access naturally lapses once
// currentPeriodEnd passes, which subscriptionStatus() already accounts for.
export async function cancelSubscription(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      cancelAtPeriodEnd: true,
      cancelledAt: new Date(),
    },
  });
}

export async function markPaymentFailed(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { paymentStatus: "FAILED" },
  }).catch(() => null);
}

export async function markPaymentRefunded(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { paymentStatus: "REFUNDED" },
  }).catch(() => null);
}
