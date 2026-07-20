import { HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FaqList } from "@/components/legal/FaqList";

export const metadata = {
  title: "Frequently Asked Questions",
};

const FAQS = [
  {
    q: "What is Gloss?",
    a: "Gloss is a vocabulary companion for readers. Scan a page, tap the words you don't know, and Gloss helps you understand them in context and remember them over time.",
  },
  {
    q: "Do I need an account?",
    a: "You can scan pages and view word meanings without an account. To save words to your personal library and review them later, you'll need to sign in. It takes one tap with Google.",
  },
  {
    q: "Can I use Gloss for free?",
    a: "Yes. Scanning pages and getting word meanings is always free (up to 40 lookups per day for guests). Saving words and reviewing them come with a 7-day free trial, followed by a small subscription.",
  },
  {
    q: "What happens to my saved words after the free trial ends?",
    a: "Nothing is ever deleted. If you don't subscribe once the trial ends, your library stays exactly as it is and you can still browse it, but saving new words and grading review sessions pause until you subscribe. Pick a plan any time and you'll pick up right where you left off.",
  },
  {
    q: "What can I scan?",
    a: "Any page with printed or clearly written text, including novels, textbooks, magazines, articles, and worksheets. Handwriting works best when it's neat and the photo is well lit.",
  },
  {
    q: "Can I delete saved words?",
    a: "Absolutely. Open the word in your Library, tap the delete button, and it will be permanently removed from your account.",
  },
  {
    q: "How do subscriptions work?",
    a: "Choose either a monthly plan (₹39/month) or a yearly plan (₹399/year) after your 7-day trial. The yearly plan effectively gives you nearly two months free.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel from your Profile page or by contacting us. You'll keep access until the end of your current billing period.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, credit and debit cards (Visa, Mastercard, RuPay), net banking, and wallets through our secure payment partner.",
  },
  {
    q: "How can I contact support?",
    a: "Email us at gloss.theta@gmail.com or use the contact form on the Contact page. We usually reply within a day.",
  },
];

export default function FaqPage() {
  return (
    <div className="space-y-6" data-testid="faq-page">
      <PageHeader
        icon={HelpCircle}
        eyebrow="FAQ"
        title="Frequently asked."
        subtitle="Quick answers to the questions we hear most."
        accent="mango"
      />

      <div className="mx-auto max-w-3xl">
        <FaqList items={FAQS} />
      </div>
    </div>
  );
}