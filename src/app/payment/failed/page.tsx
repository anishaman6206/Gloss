import Link from "next/link";
import { AlertTriangle, RefreshCcw, ArrowLeft } from "lucide-react";

export const metadata = { title: "Payment failed" };

const REASONS: Record<string, string> = {
  verification:
    "We received your payment but couldn't confirm it on our end. Please write to us, we'll fix it.",
  network:
    "We couldn't reach the payment provider. Please try again.",
  declined:
    "Your bank declined the transaction. You can try a different card or UPI ID.",
};

export default function PaymentFailedPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const msg =
    REASONS[searchParams.reason ?? ""] ??
    "The payment didn't go through this time. No charge has been made.";

  return (
    <div className="space-y-6" data-testid="payment-failed-page">
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-cherry bg-white p-8 text-center shadow-tactile shadow-cherry-shadow md:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cherry/20 blur-3xl" />

        <div className="relative">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cherry text-white shadow-tactile shadow-cherry-shadow">
            <AlertTriangle size={28} strokeWidth={2.5} />
          </span>

          <p className="mt-5 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Payment didn&apos;t go through.
          </p>

          <p className="mt-2 text-lg text-ink-soft">{msg}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pricing"
              data-testid="failed-cta-retry"
              className="btn-tactile bg-brand shadow-tactile shadow-brand-shadow"
            >
              <RefreshCcw size={16} />
              Try again
            </Link>

            <Link
              href="/scan"
              data-testid="failed-cta-scan"
              className="btn-tactile !bg-white !text-ink border-2 border-black/10 shadow-tactile shadow-black/10"
            >
              <ArrowLeft size={16} />
              Back to app
            </Link>
          </div>

          <p className="mt-6 text-xs text-ink-faint">
            Still stuck? Email{" "}
            <a
              href="mailto:gloss.ai@gmail.com"
              className="font-bold text-brand"
            >
              gloss.ai@gmail.com
            </a>{" "}
            , we usually reply within a day.
          </p>
        </div>
      </div>
    </div>
  );
}