import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fetchOrderStatus } from "@/lib/cashfree/verify";
import { activateSubscription } from "@/lib/subscription";

// The return_url Cashfree redirects the browser to once checkout reaches a
// terminal state. This is the actual "did the payment succeed" decision
// point (task: never trust the frontend) — order_id from the query string is
// only used as a lookup key, the paid/unpaid verdict always comes from
// fetchOrderStatus's call to Cashfree's own API.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.redirect(new URL("/payment/failed?reason=missing_order", req.url));
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/payment/failed?reason=unauthorized", req.url));
  }

  let verification;
  try {
    verification = await fetchOrderStatus(orderId);
  } catch {
    return NextResponse.redirect(new URL("/payment/failed?reason=verification", req.url));
  }

  if (verification.userId !== user.id || !verification.plan) {
    return NextResponse.redirect(new URL("/payment/failed?reason=verification", req.url));
  }

  if (!verification.paid) {
    return NextResponse.redirect(new URL("/payment/failed?reason=declined", req.url));
  }

  await activateSubscription({
    userId: user.id,
    plan: verification.plan,
    cashfreeOrderId: orderId,
    cashfreePaymentId: verification.paymentId,
    paymentMethod: verification.paymentMethod,
  });

  return NextResponse.redirect(
    new URL(
      `/payment/success?plan=${verification.plan}${
        verification.paymentId ? `&payment_id=${verification.paymentId}` : ""
      }`,
      req.url
    )
  );
}

export const dynamic = "force-dynamic";
