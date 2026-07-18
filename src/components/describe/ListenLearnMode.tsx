"use client";

import { useEffect, useState } from "react";
import { Volume2, ChevronRight, RotateCcw } from "lucide-react";
import { speak } from "@/lib/speak";
import { VocabAddList } from "./VocabAddList";
import type { DescribeImage } from "@/lib/types";

// Splits a sentence around any of its target vocab phrases so they can be
// rendered as highlighted, individually-speakable spans in context.
function renderHighlighted(sentence: string, phrases: string[]) {
  if (phrases.length === 0) return sentence;

  const escaped = phrases
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = sentence.split(pattern);

  return parts.map((part, i) => {
    const isVocab = phrases.some((p) => p.toLowerCase() === part.toLowerCase());
    if (!isVocab) return <span key={i}>{part}</span>;
    return (
      <button
        key={i}
        type="button"
        onClick={() => speak(part)}
        className="rounded-md bg-mango/20 px-1 font-bold text-mango-shadow underline decoration-mango decoration-2 underline-offset-4"
        data-testid={`describe-highlight-${part.toLowerCase()}`}
      >
        {part}
      </button>
    );
  });
}

export function ListenLearnMode({ image }: { image: DescribeImage }) {
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) return;
    speak(image.sentences[index]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished]);

  if (finished) {
    return <VocabAddList vocab={image.vocab} sentences={image.sentences} />;
  }

  const isLast = index === image.sentences.length - 1;
  const vocabForSentence = image.vocab.filter((v) => v.sentenceIndex === index).map((v) => v.phrase);

  return (
    <div className="space-y-4" data-testid="listen-learn-mode">
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-leaf transition-all duration-300"
            style={{ width: `${((index + 1) / image.sentences.length) * 100}%` }}
          />
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-tactile shadow-black/5">
          {index + 1} / {image.sentences.length}
        </span>
      </div>

      <div className="space-y-4 rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <div className="flex items-start justify-between gap-3">
          <p className="reveal text-xl font-medium leading-relaxed" data-testid="describe-sentence">
            {renderHighlighted(image.sentences[index], vocabForSentence)}
          </p>
          <button
            type="button"
            onClick={() => speak(image.sentences[index])}
            aria-label="Replay sentence"
            data-testid="describe-replay"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand transition-colors hover:bg-brand/20"
          >
            <Volume2 size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIndex(0)}
            disabled={index === 0}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-faint hover:text-ink disabled:opacity-30"
            data-testid="describe-restart"
          >
            <RotateCcw size={14} /> Start over
          </button>
          <button
            type="button"
            onClick={() => (isLast ? setFinished(true) : setIndex((i) => i + 1))}
            data-testid="describe-next"
            className="btn-tactile bg-brand shadow-tactile shadow-brand-shadow"
          >
            {isLast ? "See the vocab" : "Next"} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
