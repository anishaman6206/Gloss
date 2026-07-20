"use client";

import { motion } from "framer-motion";
import { Camera, BookOpen, Repeat2, ChevronRight } from "lucide-react";
import { OCRScanMockup } from "./mockups/OCRScanMockup";
import { WordPopupMockup } from "./mockups/WordPopupMockup";
import { FlashcardMockup } from "./mockups/FlashcardMockup";

const STEPS = [
  {
    icon: Camera,
    tint: "bg-brand/15 text-brand-shadow",
    title: "Snap it",
    body: "Snap the page or upload a photo you already have. Your browser reads the text right there, nothing leaves your device.",
    preview: <OCRScanMockup />,
  },
  {
    icon: BookOpen,
    tint: "bg-mango/15 text-mango-shadow",
    title: "Tap words",
    body: "Tap any word, or several at once, right on the image. Each gets its own definition based on the exact sentence it's in, not a random dictionary entry.",
    preview: <WordPopupMockup />,
  },
  {
    icon: Repeat2,
    tint: "bg-leaf/15 text-leaf-shadow",
    title: "Own it",
    body: "Saved words come back right before you'd forget them, mixed across a few quiz styles so review never feels repetitive.",
    preview: <FlashcardMockup />,
  },
];

function Connector() {
  return (
    <div className="relative hidden items-center justify-center lg:flex">
      <div className="h-0 w-10 border-t-2 border-dashed border-black/15" />
      <ChevronRight size={16} className="absolute text-black/25" />
    </div>
  );
}

export function StepsSection() {
  return (
    <div>
      <h2 className="font-display text-3xl font-bold md:text-4xl">Three quick steps.</h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="contents">
              <motion.div
                className="relative flex h-full flex-col rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
                data-testid={`how-step-${i}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }}
                viewport={{ once: true, margin: "-80px" }}
                whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${s.tint}`}
                  >
                    <Icon size={26} strokeWidth={2.4} />
                  </span>
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-white"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-1 text-ink-soft">{s.body}</p>
                <div className="mt-auto pt-4" aria-hidden="true">
                  {s.preview}
                </div>
              </motion.div>
              {i < STEPS.length - 1 && <Connector />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
