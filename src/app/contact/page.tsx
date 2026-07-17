import { Mail } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="space-y-6" data-testid="contact-page">
      <PageHeader
        icon={Mail}
        eyebrow="Contact"
        title="Say hello."
        subtitle="Feedback, bug reports, feature ideas, refund requests, or anything you'd like to send our way."
        accent="mango"
      />

      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        {/* Contact card */}
        <div className="space-y-4">
          <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
              Business
            </p>

            <p className="mt-1 font-display text-2xl font-bold">
              Gloss
            </p>

            <p className="mt-2 text-sm text-ink-soft">
              A vocabulary companion for people who love to read.
            </p>
          </div>

          <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
              Support email
            </p>

            <a
              href="mailto:gloss.theta@gmail.com"
              data-testid="contact-email"
              className="mt-1 inline-flex items-center gap-2 font-display text-lg font-bold text-brand hover:underline"
            >
              <Mail size={16} />
              gloss.theta@gmail.com
            </a>

            <p className="mt-2 text-sm text-ink-soft">
              We usually reply within a day.
            </p>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}