import Link from "next/link";
import { X, ArrowRight, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Payment cancelled",
};

export default function PaymentCancelledPage() {
  return (
    <div className="space-y-6" data-testid="payment-cancelled-page">
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-black/5 bg-white p-8 text-center shadow-tactile shadow-black/5 md:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-mango/15 blur-3xl" />

        <div className="relative">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-black/10 bg-white text-ink-soft">
            <X size={28} strokeWidth={2.5} />
          </span>

          <p className="mt-5 font-display text-4xl font-bold tracking-tight md:text-5xl">
            No worries. Nothing was charged.
          </p>

          <p className="mt-2 text-lg text-ink-soft">
            You closed the checkout before finishing. Whenever you&apos;re
            ready, pick a plan and continue right where you left off.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pricing"
              data-testid="cancelled-cta-plans"
              className="btn-tactile bg-brand shadow-tactile shadow-brand-shadow"
            >
              See plans
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/faq"
              data-testid="cancelled-cta-faq"
              className="btn-tactile border-2 border-black/10 !bg-white !text-ink shadow-tactile shadow-black/10"
            >
              <HelpCircle size={16} />
              Read FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}