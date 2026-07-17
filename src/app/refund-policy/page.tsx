import { CircleDollarSign } from "lucide-react";
import { PageHeader, Prose } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Refund Policy",
};

export default function RefundPolicyPage() {
  return (
    <div className="space-y-6" data-testid="refund-page">
      <PageHeader
        icon={CircleDollarSign}
        eyebrow="Refund Policy"
        title="Fair, simple, human."
        subtitle={`Last updated: ${new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}
        accent="cherry"
      />

      <Prose>
        <p>
          We want Gloss to feel worth the money, genuinely. Here&apos;s how
          refunds work.
        </p>

        <h2 className="mt-2 font-display text-xl font-bold">
          Monthly subscription (₹39 / month)
        </h2>

        <ul className="ml-5 list-disc space-y-1.5 text-ink-soft">
          <li>You can cancel at any time from your Profile page.</li>
          <li>
            After cancellation, you continue to have access until the end of
            your current billing month.
          </li>
          <li>Already billed months are non-refundable.</li>
        </ul>

        <h2 className="mt-4 font-display text-xl font-bold">
          Yearly subscription (₹399 / year)
        </h2>

        <ul className="ml-5 list-disc space-y-1.5 text-ink-soft">
          <li>You can cancel future renewals at any time.</li>
          <li>
            Refunds for yearly plans are provided only in specific situations,
            such as duplicate or accidental charges, or when required under
            applicable law.
          </li>
        </ul>

        <h2 className="mt-4 font-display text-xl font-bold">
          Free trial
        </h2>

        <p className="text-ink-soft">
          Your first 7 days are free. If you decide not to continue, simply
          don&apos;t subscribe and you won&apos;t be charged.
        </p>

        <h2 className="mt-4 font-display text-xl font-bold">
          How to request a refund
        </h2>

        <p className="text-ink-soft">
          Write to{" "}
          <a
            href="mailto:gloss.theta@gmail.com"
            className="font-bold text-brand"
          >
            gloss.theta@gmail.com
          </a>{" "}
          with the email address associated with your Gloss account and your
          payment reference. Eligible refunds are processed within 5 to 7
          business days to your original payment method.
        </p>

        <h2 className="mt-4 font-display text-xl font-bold">
          Chargebacks
        </h2>

        <p className="text-ink-soft">
          If you believe there&apos;s a billing issue, please email us first.
          We can usually resolve it within a day. Filing a chargeback without
          contacting us may temporarily disable your Gloss account while the
          dispute is under review.
        </p>
      </Prose>
    </div>
  );
}