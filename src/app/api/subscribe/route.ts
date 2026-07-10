import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PLANS,
  razorpayClient,
  isRazorpayConfigured,
  type PlanKey,
} from "@/lib/razorpay";

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

  const meta = PLANS[plan];
  const client = razorpayClient();

  const order = await client.orders.create({
    amount: meta.amount,
    currency: "INR",
    receipt: `gloss_${user.id.slice(0, 8)}_${Date.now()}`,
    notes: {
      userId: user.id,
      email: user.email,
      plan,
      durationDays: String(meta.durationDays),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { planId: plan },
  });

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    plan,
  });
}
