import "server-only";
import { Cashfree, CFEnvironment } from "cashfree-pg";

const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

// CASHFREE_ENV drives sandbox vs production with no code change required.
export function cashfreeMode(): "sandbox" | "production" {
  return process.env.CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox";
}

export function cashfreeClient() {
  if (!APP_ID || !SECRET_KEY) {
    throw new Error("cashfree_not_configured");
  }
  const environment =
    cashfreeMode() === "production" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  return new Cashfree(environment, APP_ID, SECRET_KEY);
}

export function isCashfreeConfigured() {
  return !!(APP_ID && SECRET_KEY);
}

// Plan catalog. Amount is in rupees (Cashfree's order_amount, unlike
// Razorpay, is not in paise). Duration is in calendar months so renewal
// lands on the same day-of-month (e.g. 17 Jul -> 17 Aug), not a fixed
// day-count that drifts against month length.
export const PLANS = {
  monthly: {
    label: "Monthly",
    price: "₹39",
    amount: 39,
    durationMonths: 1,
  },
  yearly: {
    label: "Yearly",
    price: "₹399",
    amount: 399,
    durationMonths: 12,
  },
} as const;
export type PlanKey = keyof typeof PLANS;
