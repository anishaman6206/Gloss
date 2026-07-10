import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLANS, verifyWebhookSignature, type PlanKey } from "@/lib/razorpay";

// Fallback: even if the client-side confirmation call fails, this webhook
// gives us the second guarantee that a paid user actually gets access.
export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    event: string;
    payload?: {
      payment?: {
        entity?: {
          id: string;
          order_id?: string;
          notes?: Record<string, string>;
          status?: string;
        };
      };
    };
  };

  if (payload.event !== "payment.captured") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payment = payload.payload?.payment?.entity;
  if (!payment) return NextResponse.json({ ok: true, ignored: true });

  const userId = payment.notes?.userId;
  const plan = payment.notes?.plan as PlanKey | undefined;
  if (!userId || !plan || !(plan in PLANS)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ ok: true, ignored: true });

  const meta = PLANS[plan];
  const now = new Date();
  const base =
    user.currentPeriodEnd && user.currentPeriodEnd > now ? user.currentPeriodEnd : now;
  const currentPeriodEnd = new Date(base);
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + meta.durationDays);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "active",
      planId: plan,
      currentPeriodEnd,
      razorpaySubId: payment.order_id ?? payment.id,
    },
  });

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
