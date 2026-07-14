import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { getCurrentUser, subscriptionStatus } from "@/lib/auth";
import { Confetti } from "@/components/payment/Confetti";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment successful",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: {
    plan?: string;
    payment_id?: string;
  };
}) {
  const user = await getCurrentUser();
  const sub = user ? subscriptionStatus(user) : null;

  const plan = searchParams.plan === "yearly" ? "Yearly" : "Monthly";

  return (
    <div className="space-y-6" data-testid="payment-success-page">
      <Confetti />

      <div className="relative overflow-hidden rounded-[2rem] border-2 border-leaf bg-white p-8 text-center shadow-tactile shadow-leaf-shadow md:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-leaf/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-mango/25 blur-3xl" />

        <div className="relative">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-leaf text-white shadow-tactile shadow-leaf-shadow animate-bounceIn">
            <CheckCircle2 size={28} strokeWidth={2.5} />
          </span>

          <p className="mt-5 font-display text-4xl font-bold tracking-tight md:text-5xl">
            You&apos;re in.
          </p>

          <p className="mt-2 text-lg text-ink-soft">
            {plan} subscription active
            {sub?.currentPeriodEnd
              ? ` — renews on ${new Date(
                  sub.currentPeriodEnd
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}`
              : ""}
            .
          </p>

          {searchParams.payment_id && (
            <p
              className="mt-2 text-xs text-ink-faint"
              data-testid="payment-id"
            >
              Payment ID: {searchParams.payment_id}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/scan"
              data-testid="success-cta-scan"
              className="btn-tactile bg-brand text-lg shadow-tactile shadow-brand-shadow"
            >
              <Sparkles size={18} />
              Save your next word
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/library"
              data-testid="success-cta-library"
              className="btn-tactile border-2 border-black/10 !bg-white !text-ink shadow-tactile shadow-black/10"
            >
              <BookOpen size={16} />
              Open library
            </Link>
          </div>

          <p className="mt-6 text-xs text-ink-faint">
            A receipt has been sent to your email. Need help? Write to{" "}
            <a
              href="mailto:gloss.ai@gmail.com"
              className="font-bold text-brand"
            >
              gloss.ai@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}