"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Check,
} from "lucide-react";

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
    price: "₹79",
    suffix: "/month",
    amount: 79,
    note: "Billed monthly. Cancel anytime.",
  },
  yearly: {
    label: "Yearly",
    price: "₹599",
    suffix: "/year",
    amount: 599,
    note: "Two months free. Cancel future renewals anytime.",
  },
};

declare global {
  interface Window {
    Razorpay?: new (
      opts: Record<string, unknown>
    ) => {
      open: () => void;
    };
  }
}

export function CheckoutClient({
  plan,
  isTrialing,
  daysLeft,
  userEmail,
  userName,
}: {
  plan: Plan;
  isTrialing: boolean;
  daysLeft: number;
  userEmail: string;
  userName: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = META[plan];

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
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.error === "razorpay_not_configured") {
          setError("Payments are being set up. Please try again shortly.");
        } else {
          setError("Couldn't start checkout. Please try again.");
        }
        return;
      }

      if (typeof window === "undefined" || !window.Razorpay) {
        setError("Payment widget failed to load. Please refresh and try again.");
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: "Gloss",
        description: `${meta.label} · ${meta.price}`,
        prefill: {
          email: userEmail,
          name: userName,
        },
        theme: {
          color: "#1CB0F6",
        },
        modal: {
          ondismiss: () => router.push("/payment/cancelled"),
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/subscribe/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.ok) {
              router.push(
                `/payment/success?plan=${plan}&payment_id=${response.razorpay_payment_id}`
              );
            } else {
              router.push("/payment/failed?reason=verification");
            }
          } catch {
            router.push("/payment/failed?reason=verification");
          }
        },
      });

      rzp.open();
    } catch {
      setError("Something went wrong. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

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
              {meta.price}
              <span className="ml-1 text-sm font-medium text-ink-soft">
                {meta.suffix}
              </span>
            </p>
          </div>

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
              {meta.price}
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
              : `Pay ${meta.price} securely`}
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
            Secured by Razorpay · UPI / Cards / Netbanking / Wallets
          </p>
        </div>
      </div>
    </>
  );
}