"use client";

import { useState, useTransition } from "react";
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

// v2 will add a fourth "speak" mode here (Web Speech API pronunciation scoring).
const MODES: ReviewMode[] = ["recall-flip", "fill-blank", "produce-word"];

function buildQueue(words: WordWithReview[]): QueueItem[] {
  return shuffle(words).map((word) => {
    const blanked = pickFillBlankSentence(word.examples, word.sentence, word.phrase);
    const available = MODES.filter((mode) => mode !== "fill-blank" || blanked !== null);
    const mode = available[Math.floor(Math.random() * available.length)] ?? "recall-flip";
    return { word, mode, blanked };
  });
}

export function ReviewSession({ words }: { words: WordWithReview[] }) {
  const [queue] = useState(() => buildQueue(words));
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState({ reviewed: 0, knew: 0, hesitated: 0, again: 0 });
  const [, startTransition] = useTransition();

  const current = queue[index];

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

  if (!current) {
    return <SessionSummary {...stats} />;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink/40">
        {index + 1} of {queue.length}
      </p>

      {current.mode === "recall-flip" && (
        <RecallFlip
          key={current.word.id}
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
          key={current.word.id}
          blanked={current.blanked}
          phrase={current.word.phrase}
          definition={current.word.definition}
          onGraded={handleGraded}
        />
      )}

      {current.mode === "produce-word" && (
        <ProduceWord
          key={current.word.id}
          definition={current.word.definition}
          partOfSpeech={current.word.partOfSpeech}
          phrase={current.word.phrase}
          sentence={current.word.sentence}
          onGraded={handleGraded}
        />
      )}
    </div>
  );
}
