// Plain constants (no "server-only") so both the client-side checkout UI and
// the server-side order creation can share the exact same discount math —
// the client only needs it to render the struck-through price correctly.

export const TRIAL_PROMO_CODE = "TRIAL20";
export const TRIAL_PROMO_DISCOUNT_PERCENT = 20;

export function isValidPromoCode(code: string | null | undefined): boolean {
  return !!code && code.trim().toUpperCase() === TRIAL_PROMO_CODE;
}

export function applyPromoDiscount(amount: number, code: string | null | undefined): number {
  return isValidPromoCode(code)
    ? Math.round(amount * (1 - TRIAL_PROMO_DISCOUNT_PERCENT / 100))
    : amount;
}
