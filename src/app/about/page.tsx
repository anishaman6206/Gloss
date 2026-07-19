import { Info, BookOpen, Sparkles, Heart } from "lucide-react";
import { PageHeader, Prose } from "@/components/ui/PageHeader";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="space-y-6" data-testid="about-page">
      <PageHeader
        icon={Info}
        eyebrow="About"
        title="Reading brings new words. Gloss helps you keep them."
        subtitle="A small tool for readers who want their vocabulary to grow with every page they turn."
        accent="brand"
        data-testid="about-header"
      />

      <Prose>
        <p className="text-lg leading-relaxed">
          Reading introduces us to thousands of new words. Looking them up is
          easy. Remembering them is difficult.
        </p>

        <p className="leading-relaxed text-ink-soft">
          Gloss was created to make vocabulary learning feel effortless.
          Instead of forgetting words a few minutes after seeing them, Gloss
          lets you collect them, revisit them, and gradually make them part of
          your everyday language.
        </p>

        <p className="leading-relaxed text-ink-soft">
          Whether you&apos;re reading novels, textbooks, research papers, or
          articles, Gloss helps you build vocabulary naturally while you read,
          not instead of it.
        </p>
      </Prose>

      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
        {[
          {
            icon: BookOpen,
            title: "Made for readers",
            body: "Every design decision starts from a simple question. Will this help me remember a word tomorrow?",
            tint: "bg-brand/10 text-brand-shadow",
          },
          {
            icon: Sparkles,
            title: "Warm, not clinical",
            body: "Vocabulary tools tend to feel like exams. Gloss is meant to feel like a friend who quietly helps.",
            tint: "bg-mango/15 text-mango-shadow",
          },
          {
            icon: Heart,
            title: "Yours to keep",
            body: "Your library is yours. Cancel anytime. The words you saved stay with you.",
            tint: "bg-leaf/15 text-leaf-shadow",
          },
        ].map((c, i) => {
          const Icon = c.icon;

          return (
            <div
              key={i}
              className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
              data-testid={`about-card-${i}`}
            >
              <span
                className={`grid h-11 w-11 place-items-center rounded-2xl ${c.tint}`}
              >
                <Icon size={20} strokeWidth={2.4} />
              </span>

              <h3 className="mt-3 font-display text-lg font-bold">
                {c.title}
              </h3>

              <p className="mt-1 text-sm text-ink-soft">
                {c.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}