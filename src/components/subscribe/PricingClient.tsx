"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Crown, Check, Sparkles, Loader2 } from "lucide-react";
import type { SubStatus } from "@/components/auth/AuthProvider";

type Plan = "monthly" | "yearly";

const PLAN_META: Record<Plan, { label: string; price: string; suffix: string; note: string }> = {
  monthly: { label: "Monthly", price: "₹79", suffix: "/month", note: "Billed monthly. Cancel anytime." },
  yearly: {
    label: "Yearly",
    price: "₹599",
    suffix: "/year",
    note: "≈ ₹49.9/mo · two months free.",
  },
};

const BENEFITS = [
  "Unlimited word saves",
  "Daily spaced‑repetition reviews",
  "Progress tracking & streaks",
  "Pronunciation with one tap",
  "New features first",
];

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

export function PricingClient({
  initialSub,
  userEmail,
  userName,
}: {
  initialSub: SubStatus;
  userEmail: string;
  userName: string;
}) {
  const [selected, setSelected] = useState<Plan>("yearly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sub, setSub] = useState<SubStatus>(initialSub);

  useEffect(() => setSub(initialSub), [initialSub]);

  async function subscribe() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan: selected }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.error === "razorpay_not_configured" || data.error === "plan_not_configured") {
          setError("Payments are being set up. Please try again shortly.");
        } else {
          setError("Couldn't start checkout. Try again.");
        }
        return;
      }

      if (typeof window === "undefined" || !window.Razorpay) {
        setError("Payment widget failed to load.");
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Gloss",
        description: `${PLAN_META[selected].label} subscription`,
        prefill: { email: userEmail, name: userName },
        theme: { color: "#1CB0F6" },
        handler: async () => {
          // Webhook will confirm; refresh session state after a small delay.
          setTimeout(() => window.location.reload(), 1500);
        },
      });
      rzp.open();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <header
        className="relative overflow-hidden rounded-3xl border-2 border-black/5 bg-white p-8 shadow-tactile shadow-black/5"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/25 blur-3xl" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mango/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-mango-shadow">
          <Crown size={12} /> {sub.isTrialing ? `Trial · ${sub.daysLeft}d left` : sub.isPaid ? "Pro" : "Choose a plan"}
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Keep every word.
        </h1>
        <p className="mt-2 max-w-xl text-lg text-ink-soft">
          Unlock unlimited saves and reviews. Your first 7 days are free.
        </p>
      </header>

      {/* Plan toggle */}
      <div className="grid gap-4 md:grid-cols-2" data-testid="pricing-plans">
        {(Object.keys(PLAN_META) as Plan[]).map((p) => {
          const meta = PLAN_META[p];
          const active = selected === p;
          return (
            <button
              key={p}
              onClick={() => setSelected(p)}
              data-testid={`plan-${p}`}
              className={`text-left rounded-3xl border-2 p-6 transition-all ${
                active
                  ? "border-brand bg-white shadow-tactile shadow-brand-shadow"
                  : "border-black/10 bg-white hover:border-brand/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-ink-faint">
                    {meta.label}
                  </p>
                  <p className="mt-2 font-display text-5xl font-bold leading-none">
                    {meta.price}
                    <span className="ml-1 text-base font-medium text-ink-soft">
                      {meta.suffix}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-ink-soft">{meta.note}</p>
                </div>
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full border-2 ${
                    active ? "border-brand bg-brand text-white" : "border-black/15"
                  }`}
                >
                  {active && <Check size={14} strokeWidth={3} />}
                </span>
              </div>
              {p === "yearly" && (
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-mango/15 px-2.5 py-1 text-xs font-bold text-mango-shadow">
                  <Sparkles size={10} /> Best value
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Benefits */}
      <ul className="grid gap-2 rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        {BENEFITS.map((b, i) => (
          <li key={i} className="flex items-center gap-3 text-ink">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-leaf text-white">
              <Check size={14} strokeWidth={3} />
            </span>
            {b}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={subscribe}
          disabled={loading}
          data-testid="subscribe-cta"
          className="btn-tactile bg-brand text-lg shadow-tactile shadow-brand-shadow"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Crown size={18} />}
          {sub.isPaid ? "Manage subscription" : `Continue — ${PLAN_META[selected].price}${PLAN_META[selected].suffix}`}
        </button>
        {error && (
          <p className="text-sm font-bold text-cherry" data-testid="subscribe-error">
            {error}
          </p>
        )}
        <p className="text-xs text-ink-faint">
          Secure checkout by Razorpay · Cancel anytime.
        </p>
      </div>
    </>
  );
}
