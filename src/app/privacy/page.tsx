import { Shield } from "lucide-react";
import { PageHeader, Prose } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-6" data-testid="privacy-page">
      <PageHeader
        icon={Shield}
        eyebrow="Privacy Policy"
        title="Your words, your rules."
        subtitle={`Last updated: ${new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}
        accent="brand"
      />

      <Prose>
        <p>
          This policy explains what information Gloss collects, why, and what
          we do with it. Written in plain English. No legal traps.
        </p>

        <h2 className="mt-2 font-display text-xl font-bold">
          What we collect
        </h2>

        <ul className="ml-5 list-disc space-y-1.5 text-ink-soft">
          <li>
            <b className="text-ink">Account information</b> including your name
            and profile picture from your Google account when you sign in.
          </li>

          <li>
            <b className="text-ink">Email address</b> used to identify your
            account and send receipts or important service updates.
          </li>

          <li>
            <b className="text-ink">Saved vocabulary</b> including the words you
            save, the sentence they were found in, and any notes stored with
            them.
          </li>

          <li>
            <b className="text-ink">Subscription information</b> including your
            plan, status, renewal dates, and payment references from our
            payment partner. We <b className="text-ink">do not</b> store your
            card details.
          </li>

          <li>
            <b className="text-ink">Uploaded images</b> of pages you scan.
            Images are processed only to identify words on the page.
          </li>

          <li>
            <b className="text-ink">Basic usage analytics</b> such as pages you
            visit, feature usage counts, and application errors. This helps us
            fix bugs and improve the app.
          </li>
        </ul>

        <h2 className="mt-4 font-display text-xl font-bold">
          How we use images
        </h2>

        <p className="text-ink-soft">
          When you scan a page, text is extracted from the image directly in
          your browser. We only use the image to identify the words on the page
          and help you look them up. We do not use your images for any other
          purpose.
        </p>

        <h2 className="mt-4 font-display text-xl font-bold">
          What we don&apos;t do
        </h2>

        <ul className="ml-5 list-disc space-y-1.5 text-ink-soft">
          <li>We never sell your personal information.</li>
          <li>We never share your saved vocabulary with anyone else.</li>
          <li>We do not use your data to train third-party systems.</li>
        </ul>

        <h2 className="mt-4 font-display text-xl font-bold">
          Who we share data with
        </h2>

        <p className="text-ink-soft">
          Only the services required to operate Gloss, including our hosting
          provider, database provider, authentication provider, and payment
          partner. Each is contractually required to protect your information
          and use it only to provide their services.
        </p>

        <h2 className="mt-4 font-display text-xl font-bold">
          Your choices
        </h2>

        <ul className="ml-5 list-disc space-y-1.5 text-ink-soft">
          <li>You can delete any word from your library at any time.</li>
          <li>You can cancel your subscription whenever you want.</li>
          <li>
            You can request deletion of your account and all associated data by
            writing to{" "}
            <a
              href="mailto:gloss.ai@gmail.com"
              className="font-bold text-brand"
            >
              gloss.ai@gmail.com
            </a>
            .
          </li>
        </ul>

        <h2 className="mt-4 font-display text-xl font-bold">Cookies</h2>

        <p className="text-ink-soft">
          We use a single session cookie to keep you signed in. No advertising
          cookies and no cross-site tracking.
        </p>

        <h2 className="mt-4 font-display text-xl font-bold">Contact</h2>

        <p className="text-ink-soft">
          Questions about privacy? Write to{" "}
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