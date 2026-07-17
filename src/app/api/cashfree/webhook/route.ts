import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAndParseWebhook } from "@/lib/cashfree/webhook";
import { activateSubscription, markPaymentFailed, markPaymentRefunded } from "@/lib/subscription";
import type { PlanKey } from "@/lib/cashfree/client";
import { PLANS } from "@/lib/cashfree/client";

// Fallback: even if the browser never makes it back to /api/subscribe/return
// (dropped connection, closed tab), this webhook gives us the second
// guarantee that a paid user actually gets access.
export async function POST(req: Request) {
  const signature = req.headers.get("x-webhook-signature") ?? "";
  const timestamp = req.headers.get("x-webhook-timestamp") ?? "";
  const rawBody = await req.text();

  let event;
  try {
    event = verifyAndParseWebhook(rawBody, signature, timestamp);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  const payload = event.object as {
    data?: {
      order?: { order_id?: string; order_tags?: Record<string, string> };
      payment?: { cf_payment_id?: string; payment_method?: Record<string, unknown> };
      refund?: { order_id?: string; refund_status?: string };
    };
  };

  switch (event.type) {
    case "PAYMENT_SUCCESS_WEBHOOK": {
      const order = payload.data?.order;
      const payment = payload.data?.payment;
      const userId = order?.order_tags?.userId;
      const plan = order?.order_tags?.plan as PlanKey | undefined;
      if (!userId || !plan || !(plan in PLANS) || !order?.order_id) break;

      const methodKey = payment?.payment_method
        ? Object.keys(payment.payment_method)[0] ?? null
        : null;

      await activateSubscription({
        userId,
        plan,
        cashfreeOrderId: order.order_id,
        cashfreePaymentId: payment?.cf_payment_id ?? null,
        paymentMethod: methodKey,
      });
      break;
    }

    case "PAYMENT_FAILED_WEBHOOK": {
      const order = payload.data?.order;
      const userId = order?.order_tags?.userId;
      if (userId) await markPaymentFailed(userId);
      break;
    }

    case "REFUND_STATUS_WEBHOOK": {
      const refund = payload.data?.refund;
      if (refund?.refund_status === "SUCCESS" && refund.order_id) {
        const user = await prisma.user.findFirst({
          where: { cashfreeOrderId: refund.order_id },
        });
        if (user) await markPaymentRefunded(user.id);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
