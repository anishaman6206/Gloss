import "server-only";
import { cashfreeClient } from "./client";

// Wraps the SDK's own PGVerifyWebhookSignature (HMAC-SHA256 of
// timestamp+rawBody against CASHFREE_SECRET_KEY, base64-encoded) rather than
// reimplementing it — throws on mismatch, so callers should try/catch.
export function verifyAndParseWebhook(rawBody: string, signature: string, timestamp: string) {
  return cashfreeClient().PGVerifyWebhookSignature(signature, rawBody, timestamp);
}

export type CashfreeWebhookType =
  | "PAYMENT_SUCCESS_WEBHOOK"
  | "PAYMENT_FAILED_WEBHOOK"
  | "PAYMENT_USER_DROPPED_WEBHOOK"
  | "REFUND_STATUS_WEBHOOK";
