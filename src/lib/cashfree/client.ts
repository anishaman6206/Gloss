import "server-only";
import { Cashfree, CFEnvironment } from "cashfree-pg";
export { PLANS, type PlanKey } from "@/lib/planPricing";

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

