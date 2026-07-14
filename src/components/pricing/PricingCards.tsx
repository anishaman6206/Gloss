"use client";

import Link from "next/link";
import { Check, Sparkles, Crown, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const FEATURES_MONTHLY = [
  "Unlimited saved words",
  "Unlimited reviews",
  "Contextual word meanings",
  "Vocabulary progress tracking",
];

const FEATURES_YEARLY = [
  "Everything in Monthly",
  "Two months free vs. monthly",
  "Priority feature requests",
  "Yearly progress snapshots",
];

export function PricingCards({
  isPaid,
  isTrialing,
}: {
  isPaid: boolean;
  isTrialing: boolean;
}) {
  const { user, login } = useAuth();

  function ctaFor(plan: "monthly" | "yearly") {
    if (isPaid) {
      return (
        <Link
          href="/profile"
          data-testid={`cta-manage-${plan}`}
          className="btn-tactile bg-ink text-white shadow-tactile shadow-black/40"
        >
          Manage subscription
        </Link>
      );
    }

    if (!user) {
      return (
        <button
          onClick={login}
          data-testid={`cta-signin-${plan}`}
          className={`btn-tactile ${
            plan === "yearly"
              ? "bg-mango shadow-tactile shadow-mango-shadow"
              : "bg-brand shadow-tactile shadow-brand-shadow"
          }`}
        >
          Sign in to start
        </button>
      );
    }

    return (
      <Link
        href={`/checkout?plan=${plan}`}
        data-testid={`cta-start-${plan}`}
        className={`btn-tactile ${
          plan === "yearly"
            ? "bg-mango shadow-tactile shadow-mango-shadow"
            : "bg-brand shadow-tactile shadow-brand-shadow"
        }`}
      >
        {plan === "monthly" ? "Start Monthly" : "Start Yearly"}
        <ArrowRight size={16} />
      </Link>
    );
  }

  return (
    <div className="space-y-6" data-testid="pricing-cards">
      {isTrialing && (
        <div
          className="flex items-center gap-3 rounded-2xl bg-mango/10 p-4 text-sm font-bold text-mango-shadow"
          data-testid="trial-inline-banner"
        >
          <Crown size={16} className="shrink-0" />
          Your free trial is active. Pick a plan whenever you&apos;re ready.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly */}
        <div
          className="relative rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
          data-testid="plan-card-monthly"
        >
          <p className="text-sm font-bold uppercase tracking-wider text-ink-faint">
            Monthly
          </p>

          <p className="mt-2 font-display text-5xl font-bold leading-none">
            ₹79
            <span className="ml-1 text-base font-medium text-ink-soft">
              / month
            </span>
          </p>

          <p className="mt-1 text-sm text-ink-soft">
            Billed monthly. Cancel anytime.
          </p>

          <ul className="mt-5 space-y-2 text-sm">
            {FEATURES_MONTHLY.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-leaf text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6">{ctaFor("monthly")}</div>
        </div>

        {/* Yearly */}
        <div
          className="relative overflow-hidden rounded-3xl border-2 border-mango bg-white p-6 shadow-tactile shadow-mango-shadow"
          data-testid="plan-card-yearly"
        >
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-mango px-2.5 py-1 text-xs font-bold text-white">
            <Sparkles size={12} /> Best value
          </span>

          <p className="text-sm font-bold uppercase tracking-wider text-mango-shadow">
            Yearly
          </p>

          <p className="mt-2 font-display text-5xl font-bold leading-none">
            ₹599
            <span className="ml-1 text-base font-medium text-ink-soft">
              / year
            </span>
          </p>

          <p className="mt-1 text-sm text-ink-soft">
            Two months free · works out to ₹49.9/mo.
          </p>

          <ul className="mt-5 space-y-2 text-sm">
            {FEATURES_YEARLY.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-mango text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6">{ctaFor("yearly")}</div>
        </div>
      </div>

      <p className="text-center text-xs text-ink-faint">
        Secure checkout by Razorpay · GST included where applicable · Cancel
        anytime from your profile.
      </p>
    </div>
  );
}