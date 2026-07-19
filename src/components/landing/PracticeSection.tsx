"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, ArrowRight, Image as ImageIcon } from "lucide-react";
import { OCRScanMockup } from "./mockups/OCRScanMockup";
import { ChatBubbleMockup } from "./mockups/ChatBubbleMockup";

export function PracticeSection() {
  return (
    <div>
      <h2 className="font-display text-3xl font-bold md:text-4xl">Two ways to practice.</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <motion.div
          className="relative rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
          data-testid="practice-path-scan"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/15 text-brand-shadow">
            <Camera size={22} strokeWidth={2.4} />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold">Reading something?</h3>
          <p className="mt-1 text-ink-soft">
            Snap the page, tap the words you don&apos;t know, and save them for spaced-repetition
            review.
          </p>

          <div className="mt-4">
            <OCRScanMockup />
          </div>

          <Link
            href="/scan"
            data-testid="practice-path-scan-cta"
            className="btn-tactile mt-5 !py-3.5 !px-6 text-base bg-brand shadow-tactile shadow-brand-shadow"
          >
            Scan a page <ArrowRight size={18} />
          </Link>
        </motion.div>

        <motion.div
          className="relative overflow-hidden rounded-3xl border-2 border-mango/25 bg-gradient-to-br from-mango/[0.05] to-transparent p-6 shadow-tactile shadow-mango-shadow/70"
          data-testid="practice-path-describe"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-mango/30 bg-white px-2.5 py-1 text-xs font-bold text-mango-shadow">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mango opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mango" />
            </span>
            New
          </span>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mango/15 text-mango-shadow">
            <ImageIcon size={22} strokeWidth={2.4} />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold">Want to practice speaking?</h3>
          <p className="mt-1 text-ink-soft">
            Listen to a picture described sentence by sentence, or write your own description and
            get AI feedback.
          </p>

          <div className="mt-4">
            <ChatBubbleMockup />
          </div>

          <Link
            href="/describe"
            data-testid="practice-path-describe-cta"
            className="btn-tactile mt-5 !py-3.5 !px-6 text-base bg-mango shadow-tactile shadow-mango-shadow"
          >
            Try picture practice <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
