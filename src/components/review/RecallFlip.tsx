"use client";

import { useState } from "react";
import { GradeButtons } from "./GradeButtons";
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
    <div className="space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-6">
      <p className="text-xs uppercase tracking-wide text-ink/50">Recall the meaning</p>
      <p className="text-lg leading-relaxed">{highlight(sentence, phrase)}</p>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper"
        >
          Reveal
        </button>
      ) : (
        <div className="space-y-3 rounded-xl bg-ink/5 p-4">
          <p className="font-medium">{phrase}</p>
          <p>{definition}</p>
          <p className="text-sm italic text-ink/60">{partOfSpeech}</p>
          {examples.length > 0 && (
            <ul className="space-y-1 text-sm text-ink/70">
              {examples.map((example, i) => (
                <li key={i}>&ldquo;{example}&rdquo;</li>
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
      <span className="rounded bg-yellow-200/70 px-1 font-medium">{match}</span>
      {after}
    </>
  );
}
