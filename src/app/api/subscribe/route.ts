import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, razorpayClient, isRazorpayConfigured, type PlanKey } from "@/lib/razorpay";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { ok: false, error: "razorpay_not_configured" },
      { status: 501 }
    );
  }

  const { plan } = (await req.json().catch(() => ({}))) as { plan?: PlanKey };
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ ok: false, error: "invalid_plan" }, { status: 400 });
  }

  const planId = PLANS[plan].id();
  if (!planId) {
    return NextResponse.json({ ok: false, error: "plan_not_configured" }, { status: 501 });
  }

  const client = razorpayClient();
  const subscription = await client.subscriptions.create({
    plan_id: planId,
    total_count: plan === "monthly" ? 12 : 1, // 12 months or 1 year
    quantity: 1,
    customer_notify: 1,
    notes: { userId: user.id, email: user.email },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planId,
      razorpaySubId: subscription.id,
    },
  });

  return NextResponse.json({
    ok: true,
    subscriptionId: subscription.id,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
