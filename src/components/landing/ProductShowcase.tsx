"use client";

import { motion } from "framer-motion";
import { WordPopupMockup } from "./mockups/WordPopupMockup";
import { LibraryRowMockup } from "./mockups/LibraryRowMockup";
import { FlashcardMockup } from "./mockups/FlashcardMockup";
import { StatsMockup } from "./mockups/StatsMockup";

const ROWS = [
  {
    eyebrow: "Word lookup",
    title: "Never interrupt your reading just to open a dictionary.",
    body: "Tap a word without leaving the page. The definition comes from the exact sentence you tapped, with synonyms and an example one glance away.",
    mockup: (
      <WordPopupMockup
        className="mx-auto max-w-sm"
        word="ephemeral"
        definition="lasting for a very short time"
        partOfSpeech="adjective"
        synonyms={["fleeting", "transient", "momentary"]}
        examples={[
          "The morning mist was ephemeral, vanishing the moment sunlight touched the hills.",
          "Fame in the digital age can feel ephemeral, here one day and forgotten the next.",
        ]}
      />
    ),
    tint: "bg-brand/15 text-brand-shadow",
  },
  {
    eyebrow: "Your library",
    title: "Stop taking screenshots you'll never revisit.",
    body: "Every word you save is sorted into new, learning, and learned automatically, with struggling words flagged so you know exactly what to focus on.",
    mockup: <LibraryRowMockup className="mx-auto max-w-sm" />,
    tint: "bg-mango/15 text-mango-shadow",
  },
  {
    eyebrow: "Spaced repetition",
    title: "Remember words months later instead of forgetting them tomorrow.",
    body: "SM-2 spaced repetition schedules each word right before you're about to forget it. Recall, fill-blank, and produce-word keep it from feeling repetitive.",
    mockup: <FlashcardMockup className="mx-auto max-w-sm" />,
    tint: "bg-leaf/15 text-leaf-shadow",
  },
  {
    eyebrow: "Progress",
    title: "See proof you're actually improving, not just guessing.",
    body: "A daily streak and a 14-day review history keep momentum visible, so showing up becomes the habit, not the chore.",
    mockup: <StatsMockup className="mx-auto max-w-sm" />,
    tint: "bg-brand/15 text-brand-shadow",
  },
];

export function ProductShowcase() {
  return (
    <div data-testid="product-showcase">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          What Gloss actually looks like.
        </h2>
        <p className="mt-2 text-lg text-ink-soft">
          No paragraphs required. Here&apos;s the whole loop, screen by screen.
        </p>
      </div>

      <div className="mt-8 space-y-12 md:space-y-16">
        {ROWS.map((row, i) => {
          const reversed = i % 2 === 1;
          return (
            <motion.div
              key={row.title}
              className={`grid items-center gap-8 md:gap-12 ${
                reversed
                  ? "md:grid-cols-[1fr_0.82fr] md:[&>*:first-child]:order-2"
                  : "md:grid-cols-[0.82fr_1fr]"
              }`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${row.tint}`}
                >
                  {row.eyebrow}
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">
                  {row.title}
                </h3>
                <p className="mt-3 max-w-md text-ink-soft">{row.body}</p>
              </div>

              <div aria-hidden="true">{row.mockup}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
