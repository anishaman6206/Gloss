import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, verifyCheckoutSignature, type PlanKey } from "@/lib/razorpay";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    orderId?: string;
    paymentId?: string;
    signature?: string;
    plan?: PlanKey;
  };
  const { orderId, paymentId, signature, plan } = body;

  if (!orderId || !paymentId || !signature || !plan || !(plan in PLANS)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  if (!verifyCheckoutSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 400 });
  }

  const meta = PLANS[plan];
  // Extend from max(now, currentPeriodEnd) so re-purchases stack cleanly.
  const now = new Date();
  const base =
    user.currentPeriodEnd && user.currentPeriodEnd > now ? user.currentPeriodEnd : now;
  const currentPeriodEnd = new Date(base);
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + meta.durationDays);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "active",
      planId: plan,
      currentPeriodEnd,
      razorpaySubId: orderId,
    },
  });

  return NextResponse.json({ ok: true, currentPeriodEnd });
}
