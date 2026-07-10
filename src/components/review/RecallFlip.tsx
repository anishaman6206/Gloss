"use client";

import { useState } from "react";
import { Volume2, Eye, Sparkles } from "lucide-react";
import { GradeButtons } from "./GradeButtons";
import { speak } from "@/lib/speak";
import type { ReviewQuality } from "@/lib/types";

export function RecallFlip({
  sentence,
  phrase,
  definition,
  partOfSpeech,
  examples,
  onGraded,
}: {
  sentence: string;
  phrase: string;
  definition: string;
  partOfSpeech: string;
  examples: string[];
  onGraded: (quality: ReviewQuality) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="space-y-4 rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
      data-testid="recall-flip"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-shadow">
        Recall the meaning
      </span>
      <p className="text-xl leading-relaxed">{highlight(sentence, phrase)}</p>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          data-testid="recall-reveal"
          className="btn-tactile bg-brand shadow-tactile shadow-brand-shadow"
        >
          <Eye size={16} /> Reveal
        </button>
      ) : (
        <div className="reveal space-y-3 rounded-2xl bg-brand/5 p-4">
          <div className="flex items-center gap-2">
            <p className="font-display text-2xl font-bold">{phrase}</p>
            <button
              onClick={() => speak(phrase)}
              aria-label="Hear pronunciation"
              data-testid="recall-speak"
              className="grid h-8 w-8 place-items-center rounded-xl bg-brand/10 text-brand hover:bg-brand/20"
            >
              <Volume2 size={14} strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-lg">{definition}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
            {partOfSpeech}
          </p>
          {examples.length > 0 && (
            <ul className="space-y-1 text-sm text-ink-soft">
              {examples.map((example, i) => (
                <li key={i} className="flex gap-2">
                  <Sparkles size={12} className="mt-1 shrink-0 text-mango" />
                  <span>&ldquo;{example}&rdquo;</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {revealed && <GradeButtons onGrade={onGraded} />}
    </div>
  );
}

function highlight(sentence: string, phrase: string) {
  const idx = sentence.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx === -1) return sentence;
  const before = sentence.slice(0, idx);
  const match = sentence.slice(idx, idx + phrase.length);
  const after = sentence.slice(idx + phrase.length);
  return (
    <>
      {before}
      <span className="rounded-md bg-mango/40 px-1.5 font-bold">{match}</span>
      {after}
    </>
  );
}
