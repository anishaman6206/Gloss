import { FileText } from "lucide-react";
import { PageHeader, Prose } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <div className="space-y-6" data-testid="terms-page">
      <PageHeader
        icon={FileText}
        eyebrow="Terms & Conditions"
        title="The ground rules."
        subtitle={`Last updated: ${new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}
        accent="leaf"
      />

      <Prose>
        <p>
          By using Gloss you agree to these terms. If anything feels unclear,
          write to us at{" "}
          <a
            href="mailto:gloss.ai@gmail.com"
            className="font-bold text-brand"
          >
            gloss.ai@gmail.com
          </a>{" "}
          and we'll happily explain.
        </p>

        <h2 className="mt-2 font-display text-xl font-bold">
          Your content stays yours
        </h2>

        <p className="text-ink-soft">
          You own everything you upload, including the pages you scan and the
          words you save. Gloss stores this content only to provide the service
          to you.
        </p>

        <h2 className="mt-4 font-display text-xl font-bold">
          Only upload what&apos;s yours to use
        </h2>

        <p className="text-ink-soft">
          Please upload only content you have the right to use, such as books
          you own, articles you have permission to access, or your own notes.
          Do not use Gloss to reproduce or distribute copyrighted material.
        </p>

        <h2 className="mt-4 font-display text-xl font-bold">Accounts</h2>

        <p className="text-ink-soft">
          You&apos;re responsible for the activity on your account. If we find
          an account being used to abuse the service, spam others, or attempt to
          compromise the app, we may suspend or terminate it.
        </p>

        <h2 className="mt-4 font-display text-xl font-bold">
          Subscriptions
        </h2>

        <ul className="ml-5 list-disc space-y-1.5 text-ink-soft">
          <li>You get a 7-day free trial when you first sign in.</li>
          <li>
            After the trial, you can subscribe monthly (₹39) or yearly (₹399).
          </li>
          <li>
            Payments are billed on your selected billing cycle through our
            payment partner.
          </li>
          <li>You can cancel at any time from your Profile page.</li>
          <li>
            See our{" "}
            <a href="/refund-policy" className="font-bold text-brand">
              Refund Policy
            </a>{" "}
            for details about refunds.
          </li>
        </ul>

        <h2 className="mt-4 font-display text-xl font-bold">
          Acceptable use
        </h2>

        <p className="text-ink-soft">Don&apos;t use Gloss to:</p>

        <ul className="ml-5 list-disc space-y-1.5 text-ink-soft">
          <li>Attack, scrape, or reverse-engineer the service.</li>
          <li>Upload harmful, illegal, or abusive content.</li>
          <li>
            Impersonate another person or use the service in violation of
            applicable laws.
          </li>
        </ul>

        <h2 className="mt-4 font-display text-xl font-bold">
          Service changes
        </h2>

        <p className="text-ink-soft">
          We&apos;re a young product. Features may change, improve, or
          occasionally break. We&apos;ll do our best to keep the service stable
          and communicate significant changes in advance whenever possible.
        </p>

        <h2 className="mt-4 font-display text-xl font-bold">
          No warranties
        </h2>

        <p className="text-ink-soft">
          Gloss is provided &ldquo;as is&rdquo;. We work hard to keep it
          reliable, but we can&apos;t guarantee uninterrupted availability. Our
          liability is limited to the amount you paid us in the last 12 months.
        </p>

        <h2 className="mt-4 font-display text-xl font-bold">
          Governing law
        </h2>

        <p className="text-ink-soft">
          These terms are governed by the laws of India. Any disputes are
          subject to the jurisdiction of Indian courts.
        </p>

        <h2 className="mt-4 font-display text-xl font-bold">Contact</h2>

        <p className="text-ink-soft">
          Questions about these terms? Write to{" "}
          <a
            href="mailto:gloss.ai@gmail.com"
            className="font-bold text-brand"
          >
            gloss.ai@gmail.com
          </a>
          .
        </p>
      </Prose>
    </div>
  );
}