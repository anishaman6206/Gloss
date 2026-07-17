import "server-only";
import { cashfreeClient } from "./client";
import type { PlanKey } from "./client";

export type OrderVerification = {
  paid: boolean;
  orderId: string;
  userId: string | null;
  plan: PlanKey | null;
  paymentId: string | null;
  paymentMethod: string | null;
};

// The one place payment success is decided. Only ever called with an
// order_id (from the redirect or a webhook) as a lookup key — the actual
// paid/unpaid verdict always comes from Cashfree's own API response, never
// from anything the client or a webhook payload claims.
export async function fetchOrderStatus(orderId: string): Promise<OrderVerification> {
  const client = cashfreeClient();

  const orderRes = await client.PGFetchOrder(orderId);
  const order = orderRes.data;
  const tags = order.order_tags ?? {};
  const userId = tags.userId ?? null;
  const plan = (tags.plan as PlanKey | undefined) ?? null;

  const paymentsRes = await client.PGOrderFetchPayments(orderId);
  const payments = paymentsRes.data ?? [];
  const success = payments.find((p) => p.payment_status === "SUCCESS");

  if (!success) {
    return { paid: false, orderId, userId, plan, paymentId: null, paymentMethod: null };
  }

  const methodKey = success.payment_method
    ? Object.keys(success.payment_method)[0] ?? null
    : null;

  return {
    paid: true,
    orderId,
    userId,
    plan,
    paymentId: success.cf_payment_id ?? null,
    paymentMethod: methodKey,
  };
}
