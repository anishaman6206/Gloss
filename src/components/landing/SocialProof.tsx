"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Aanya R.",
    role: "Grad student",
    quote:
      "I used to highlight words I didn't know and never look at them again. With Gloss they actually stick.",
    initials: "AR",
    gradient: "from-brand to-brand-shadow",
  },
  {
    name: "Marcus T.",
    role: "Book club regular",
    quote:
      "Scanning a page and getting a definition based on that exact sentence beats switching apps every time.",
    initials: "MT",
    gradient: "from-mango to-mango-shadow",
  },
  {
    name: "Priya K.",
    role: "Language learner",
    quote:
      "The daily review takes about two minutes and I've kept my streak going for a month now.",
    initials: "PK",
    gradient: "from-leaf to-leaf-shadow",
  },
];

export function SocialProof() {
  return (
    <div data-testid="social-proof">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          Readers are already keeping their words.
        </h2>
      </div>

      <div
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0"
        data-testid="testimonial-list"
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            className="flex w-[82%] shrink-0 snap-center flex-col rounded-3xl border-2 border-black/5 bg-white p-7 shadow-tactile shadow-black/5 sm:w-[65%] md:w-auto md:min-h-[220px]"
            data-testid={`testimonial-${t.initials}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-mango text-mango" />
              ))}
            </div>

            <p className="mt-3 text-ink">&ldquo;{t.quote}&rdquo;</p>

            <div className="mt-5 flex items-center gap-3 md:mt-auto md:pt-5">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-bold text-white`}
                aria-hidden="true"
              >
                {t.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-bold">{t.name}</p>
                <p className="truncate text-sm text-ink-faint">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
