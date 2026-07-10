import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";

const RAZ_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZ_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export function razorpayClient() {
  if (!RAZ_KEY_ID || !RAZ_KEY_SECRET) {
    throw new Error("razorpay_not_configured");
  }
  return new Razorpay({ key_id: RAZ_KEY_ID, key_secret: RAZ_KEY_SECRET });
}

export function isRazorpayConfigured() {
  return !!(RAZ_KEY_ID && RAZ_KEY_SECRET);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Verify a checkout success payload on the server before extending access.
 * Signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret).
 */
export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!RAZ_KEY_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", RAZ_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return (
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}

// Plan catalog. Amounts are in paise. Duration = number of days to extend on success.
export const PLANS = {
  monthly: {
    label: "Monthly",
    price: "₹79",
    amount: 7900,
    durationDays: 30,
  },
  yearly: {
    label: "Yearly",
    price: "₹599",
    amount: 59900,
    durationDays: 365,
  },
} as const;
export type PlanKey = keyof typeof PLANS;
