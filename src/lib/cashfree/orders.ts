import "server-only";
import { cashfreeClient, PLANS, type PlanKey } from "./client";

function baseUrl() {
  // Same origin convention already used for NextAuth's callback URL.
  return (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
}

// Cashfree requires a customer_phone even though Gloss never collects one;
// this fixed placeholder is sent for every order (sandbox-safe, and Cashfree
// does not SMS/validate it unless phone-based payment methods are enabled).
const PLACEHOLDER_PHONE = "9999999999";

export async function createOrder(
  user: { id: string; email: string; name: string },
  plan: PlanKey
) {
  const meta = PLANS[plan];
  const client = cashfreeClient();
  const orderId = `gloss_${user.id.slice(0, 8)}_${Date.now()}`;
  const origin = baseUrl();

  const response = await client.PGCreateOrder({
    order_id: orderId,
    order_amount: meta.amount,
    order_currency: "INR",
    customer_details: {
      customer_id: user.id,
      customer_name: user.name,
      customer_email: user.email,
      customer_phone: PLACEHOLDER_PHONE,
    },
    order_meta: {
      return_url: `${origin}/api/subscribe/return?order_id={order_id}`,
      ...(origin.startsWith("https://") ? { notify_url: `${origin}/api/cashfree/webhook` } : {}),
    },
    order_tags: {
      userId: user.id,
      plan,
    },
  });

  const order = response.data;
  if (!order.payment_session_id || !order.order_id) {
    throw new Error("cashfree_order_incomplete");
  }

  return {
    orderId: order.order_id,
    paymentSessionId: order.payment_session_id,
  };
}
