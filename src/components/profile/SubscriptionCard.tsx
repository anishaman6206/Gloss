"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Crown, Loader2, AlertTriangle } from "lucide-react";
import type { DisplayStatus } from "@/lib/auth";

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SubscriptionCard({
  displayStatus,
  planLabel,
  planPrice,
  trialEndsAt,
  daysLeft,
  subscriptionStart,
  currentPeriodEnd,
  paymentStatus,
}: {
  displayStatus: DisplayStatus;
  planLabel: string | null;
  planPrice: string | null;
  trialEndsAt: string | null;
  daysLeft: number;
  subscriptionStart: string | null;
  currentPeriodEnd: string | null;
  paymentStatus: string | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscribe/cancel", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError("Couldn't cancel your subscription. Please try again.");
        return;
      }
      setConfirming(false);
      router.refresh();
    } catch {
      setError("Couldn't cancel your subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const statusLabel =
    displayStatus === "active"
      ? "Active"
      : displayStatus === "cancelling"
      ? "Cancelling"
      : displayStatus === "expired"
      ? "Expired"
      : displayStatus === "trialing"
      ? `Trial · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
      : "Free";

  const statusStyle =
    displayStatus === "active"
      ? "bg-leaf/15 text-leaf-shadow"
      : displayStatus === "cancelling"
      ? "bg-mango/15 text-mango-shadow"
      : displayStatus === "expired"
      ? "bg-cherry/10 text-cherry"
      : displayStatus === "trialing"
      ? "bg-mango/15 text-mango-shadow"
      : "bg-black/[0.04] text-ink-soft";

  return (
    <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
          Subscription
        </p>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusStyle}`}
          data-testid="subscription-status-badge"
        >
          <Crown size={12} />
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        {(displayStatus === "active" || displayStatus === "cancelling") && (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className="text-ink-soft">Plan</span>
              <span className="font-bold">Pro {planLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-ink-soft">Billing amount</span>
              <span className="font-bold">{planPrice}</span>
            </div>
            {subscriptionStart && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-soft">Start date</span>
                <span className="font-bold">{formatDate(subscriptionStart)}</span>
              </div>
            )}
            {currentPeriodEnd && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-soft">
                  {displayStatus === "cancelling" ? "Access until" : "Next renewal"}
                </span>
                <span className="font-bold">{formatDate(currentPeriodEnd)}</span>
              </div>
            )}
            {paymentStatus && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-soft">Payment status</span>
                <span className="font-bold">{paymentStatus}</span>
              </div>
            )}
          </>
        )}

        {displayStatus === "trialing" && trialEndsAt && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-soft">Trial ends</span>
            <span className="font-bold">{formatDate(trialEndsAt)}</span>
          </div>
        )}
      </div>

      {displayStatus === "cancelling" && currentPeriodEnd && (
        <div
          className="mt-5 flex items-start gap-2 rounded-2xl bg-mango/10 p-3 text-sm font-bold text-mango-shadow"
          data-testid="subscription-cancelled-note"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Your subscription has been cancelled. You will continue to enjoy Pro
          benefits until {formatDate(currentPeriodEnd)}.
        </div>
      )}

      {(displayStatus === "free" || displayStatus === "trialing") && (
        <Link
          href="/pricing"
          data-testid="profile-upgrade"
          className="btn-tactile mt-5 bg-brand shadow-tactile shadow-brand-shadow"
        >
          <Crown size={16} />
          {displayStatus === "trialing" ? "Choose a plan" : "Upgrade Plan"}
          <ArrowRight size={16} />
        </Link>
      )}

      {displayStatus === "expired" && (
        <Link
          href="/pricing"
          data-testid="profile-resubscribe"
          className="btn-tactile mt-5 bg-brand shadow-tactile shadow-brand-shadow"
        >
          <Crown size={16} />
          Renew subscription
          <ArrowRight size={16} />
        </Link>
      )}

      {displayStatus === "active" && !confirming && (
        <button
          onClick={() => setConfirming(true)}
          data-testid="subscription-cancel-open"
          className="btn-tactile mt-5 bg-cherry text-white shadow-tactile shadow-cherry-shadow"
        >
          Cancel Subscription
        </button>
      )}

      {displayStatus === "active" && confirming && (
        <div className="mt-5 space-y-3 rounded-2xl bg-black/[0.03] p-4">
          <p className="text-sm font-bold text-ink">
            Cancel your Pro subscription?
          </p>
          <p className="text-sm text-ink-soft">
            You&apos;ll keep Pro access until{" "}
            {formatDate(currentPeriodEnd) ?? "your period ends"}, then be
            moved to the Free plan. This won&apos;t charge you again.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={cancel}
              disabled={loading}
              data-testid="subscription-cancel-confirm"
              className="btn-tactile bg-cherry text-white shadow-tactile shadow-cherry-shadow"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Yes, cancel
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={loading}
              data-testid="subscription-cancel-dismiss"
              className="btn-tactile border-2 border-black/10 !bg-white !text-ink shadow-tactile shadow-black/10"
            >
              Keep my subscription
            </button>
          </div>

          {error && (
            <p className="text-sm font-bold text-cherry" data-testid="subscription-cancel-error">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
