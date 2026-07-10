import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    event: string;
    payload?: {
      subscription?: {
        entity?: {
          id: string;
          status: string;
          current_end?: number;
          notes?: Record<string, string>;
        };
      };
    };
  };

  const sub = payload.payload?.subscription?.entity;
  if (!sub) return NextResponse.json({ ok: true, ignored: true });

  const userId = sub.notes?.userId;
  if (!userId) return NextResponse.json({ ok: true, ignored: true });

  let status = "trialing";
  switch (payload.event) {
    case "subscription.activated":
    case "subscription.charged":
    case "subscription.resumed":
      status = "active";
      break;
    case "subscription.halted":
    case "subscription.paused":
      status = "past_due";
      break;
    case "subscription.cancelled":
    case "subscription.completed":
      status = "cancelled";
      break;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: status,
      currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : undefined,
      razorpaySubId: sub.id,
    },
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
