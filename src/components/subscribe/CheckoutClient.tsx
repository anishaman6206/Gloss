"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { load as loadCashfree } from "@cashfreepayments/cashfree-js";
import {
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Check,
  Tag,
} from "lucide-react";
import { isValidPromoCode, applyPromoDiscount, TRIAL_PROMO_DISCOUNT_PERCENT } from "@/lib/promoCode";

type Plan = "monthly" | "yearly";

const META: Record<
  Plan,
  {
    label: string;
    price: string;
    suffix: string;
    amount: number;
    note: string;
  }
> = {
  monthly: {
    label: "Monthly",
    price: "₹39",
    suffix: "/month",
    amount: 39,
    note: "Billed monthly. Cancel anytime.",
  },
  yearly: {
    label: "Yearly",
    price: "₹399",
    suffix: "/year",
    amount: 399,
    note: "Nearly 2 months free. Cancel future renewals anytime.",
  },
};

export function CheckoutClient({
  plan,
  isTrialing,
  daysLeft,
  promo,
}: {
  plan: Plan;
  isTrialing: boolean;
  daysLeft: number;
  promo?: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = META[plan];
  const promoApplied = isValidPromoCode(promo);
  const discountedAmount = applyPromoDiscount(meta.amount, promo);
  const discountedPrice = `₹${discountedAmount}`;

  async function pay() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ plan, promo }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.error === "cashfree_not_configured") {
          setError("Payments are being set up. Please try again shortly.");
        } else {
          setError("Couldn't start checkout. Please try again.");
        }
        return;
      }

      const cashfree = await loadCashfree({ mode: data.mode });
      if (!cashfree) {
        setError("Payment widget failed to load. Please refresh and try again.");
        return;
      }

      // redirectTarget "_self" is a full-page navigation rather than a
      // popup/iframe, which is what keeps this working inside the Median
      // Android WebView. Cashfree redirects back to order_meta.return_url
      // (set server-side at order creation), which is where the payment is
      // actually verified and the subscription activated.
      const result = await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });

      if (result?.error) {
        setError("Something went wrong. Try again in a moment.");
      }
    } catch {
      setError("Something went wrong. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-6" data-testid="checkout-page">
        <button
          onClick={() => router.back()}
          data-testid="checkout-back"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-bold text-ink-soft shadow-tactile shadow-black/5 hover:text-ink"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5 md:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
            Order summary
          </p>

          <div className="mt-3 flex items-baseline justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-bold">
                Gloss {meta.label}
              </p>

              <p className="text-sm text-ink-soft">
                {meta.note}
              </p>
            </div>

            <p className="whitespace-nowrap font-display text-4xl font-bold">
              {promoApplied ? (
                <>
                  <span className="mr-2 text-xl font-medium text-ink-faint line-through">
                    {meta.price}
                  </span>
                  {discountedPrice}
                </>
              ) : (
                meta.price
              )}
              <span className="ml-1 text-sm font-medium text-ink-soft">
                {meta.suffix}
              </span>
            </p>
          </div>

          {promoApplied && (
            <div
              className="mt-4 flex items-center gap-2 rounded-2xl bg-brand/10 p-3 text-sm font-bold text-brand-shadow"
              data-testid="checkout-promo-note"
            >
              <Tag size={16} className="shrink-0" />
              {TRIAL_PROMO_DISCOUNT_PERCENT}% off applied
            </div>
          )}

          {isTrialing && (
            <div
              className="mt-4 flex items-center gap-2 rounded-2xl bg-leaf/10 p-3 text-sm font-bold text-leaf-shadow"
              data-testid="checkout-trial-note"
            >
              <Check size={16} className="shrink-0" />
              Your free trial has {daysLeft} day
              {daysLeft === 1 ? "" : "s"} left. No charge until it ends.
            </div>
          )}

          <hr className="my-5 border-black/5" />

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-wider text-ink-faint">
              Total
            </p>

            <p className="font-display text-3xl font-bold">
              {promoApplied ? discountedPrice : meta.price}
              <span className="ml-1 text-sm font-medium text-ink-soft">
                {meta.suffix}
              </span>
            </p>
          </div>

          <button
            onClick={pay}
            disabled={loading}
            data-testid="checkout-pay"
            className="btn-tactile mt-6 w-full !justify-center bg-brand text-lg shadow-tactile shadow-brand-shadow"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShieldCheck size={18} />
            )}

            {loading
              ? "Opening secure checkout…"
              : `Pay ${promoApplied ? discountedPrice : meta.price} securely`}
          </button>

          {error && (
            <p
              className="mt-3 text-sm font-bold text-cherry"
              data-testid="checkout-error"
            >
              {error}
            </p>
          )}

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
            <ShieldCheck size={12} />
            Secured by Cashfree · UPI / Cards / Netbanking / Wallets
          </p>
        </div>
      </div>
    </>
  );
}