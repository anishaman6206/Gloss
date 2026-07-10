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

export const PLANS = {
  monthly: { id: () => process.env.RAZORPAY_PLAN_MONTHLY_ID, amount: 7900, label: "Monthly", price: "₹79" },
  yearly:  { id: () => process.env.RAZORPAY_PLAN_YEARLY_ID,  amount: 59900, label: "Yearly",  price: "₹599" },
} as const;
export type PlanKey = keyof typeof PLANS;
