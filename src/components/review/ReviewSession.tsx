"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gradeReview } from "@/lib/actions";
import { pickFillBlankSentence } from "@/lib/review";
import { RecallFlip } from "./RecallFlip";
import { FillBlank } from "./FillBlank";
import { ProduceWord } from "./ProduceWord";
import { SessionSummary } from "./SessionSummary";
import type { ReviewMode, ReviewQuality, WordWithReview } from "@/lib/types";

type QueueItem = {
  word: WordWithReview;
  mode: ReviewMode;
  blanked: string | null;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const MODES: ReviewMode[] = ["recall-flip", "fill-blank", "produce-word"];
const FALLBACK_MODES: ReviewMode[] = ["recall-flip", "produce-word"];

// Picks each mode with equal 1-in-3 odds regardless of how often fill-blank
// happens to have a usable blanked sentence, so a better (or worse) blank
// match rate never dilutes how often recall-flip/produce-word show up.
// Only when fill-blank is picked but has no valid blank do we redraw between
// the other two modes.
function buildQueue(words: WordWithReview[]): QueueItem[] {
  return shuffle(words).map((word) => {
    const blanked = pickFillBlankSentence(word.examples, word.sentence, word.phrase);
    const intended = MODES[Math.floor(Math.random() * MODES.length)];
    const mode =
      intended === "fill-blank" && blanked === null
        ? FALLBACK_MODES[Math.floor(Math.random() * FALLBACK_MODES.length)]
        : intended;
    return { word, mode, blanked };
  });
}

export function ReviewSession({ words }: { words: WordWithReview[] }) {
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState({ reviewed: 0, knew: 0, hesitated: 0, again: 0 });
  const [, startTransition] = useTransition();

  // Randomize only after mount to avoid SSR/client hydration mismatch.
  useEffect(() => {
    setQueue(buildQueue(words));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!queue) {
    return (
      <div className="rounded-3xl border-2 border-black/5 bg-white p-6 text-center text-ink-soft shadow-tactile shadow-black/5">
        Loading your session…
      </div>
    );
  }

  const current = queue[index];
  const total = queue.length;
  const progress = total > 0 ? (index / total) * 100 : 0;

  function handleGraded(quality: ReviewQuality) {
    if (!current) return;

    startTransition(() => {
      gradeReview(current.word.id, quality);
    });

    setStats((prev) => ({
      reviewed: prev.reviewed + 1,
      knew: prev.knew + (quality >= 4 ? 1 : 0),
      hesitated: prev.hesitated + (quality === 3 ? 1 : 0),
      again: prev.again + (quality < 3 ? 1 : 0),
    }));
    setIndex((i) => i + 1);
  }

  if (!current) return <SessionSummary {...stats} />;

  return (
    <div className="space-y-4" data-testid="review-session">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="h-full rounded-full bg-gradient-to-r from-brand to-leaf"
          />
        </div>
        <span
          className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-tactile shadow-black/5"
          data-testid="review-progress"
        >
          {index + 1} / {total}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.word.id + current.mode}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          {current.mode === "recall-flip" && (
            <RecallFlip
              sentence={current.word.sentence}
              phrase={current.word.phrase}
              definition={current.word.definition}
              partOfSpeech={current.word.partOfSpeech}
              examples={current.word.examples}
              onGraded={handleGraded}
            />
          )}

          {current.mode === "fill-blank" && current.blanked && (
            <FillBlank
              blanked={current.blanked}
              phrase={current.word.phrase}
              definition={current.word.definition}
              onGraded={handleGraded}
            />
          )}

          {current.mode === "produce-word" && (
            <ProduceWord
              definition={current.word.definition}
              partOfSpeech={current.word.partOfSpeech}
              phrase={current.word.phrase}
              sentence={current.word.sentence}
              onGraded={handleGraded}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
