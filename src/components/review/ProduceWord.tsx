"use client";

import { useState } from "react";
import { Volume2, Check } from "lucide-react";
import { GradeButtons } from "./GradeButtons";
import { speak } from "@/lib/speak";
import type { ReviewQuality } from "@/lib/types";

export function ProduceWord({
  definition,
  partOfSpeech,
  phrase,
  sentence,
  onGraded,
}: {
  definition: string;
  partOfSpeech: string;
  phrase: string;
  sentence: string;
  onGraded: (quality: ReviewQuality) => void;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const correct = value.trim().toLowerCase() === phrase.trim().toLowerCase();

  return (
    <div
      className="space-y-4 rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
      data-testid="produce-word"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-leaf-shadow">
        What&apos;s the word?
      </span>
      <p className="text-xl leading-relaxed">{definition}</p>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
        {partOfSpeech}
      </p>

      {!checked ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setChecked(true);
          }}
          className="flex gap-2"
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type the word…"
            data-testid="produce-input"
            className="flex-1 rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-3 text-base font-medium outline-none focus:border-brand focus:bg-white"
          />
          <button
            type="submit"
            data-testid="produce-check"
            className="btn-tactile bg-brand !py-3 !px-5 shadow-tactile shadow-brand-shadow"
          >
            <Check size={16} /> Check
          </button>
        </form>
      ) : (
        <div className={`reveal space-y-3 rounded-2xl p-4 ${correct ? "bg-leaf/10" : "bg-cherry/10"}`}>
          <div className="flex items-center gap-2">
            <p
              className={`font-display text-xl font-bold ${
                correct ? "text-leaf-shadow" : "text-cherry"
              }`}
            >
              {correct ? "Correct: " : "It was: "}
              {phrase}
            </p>
            <button
              onClick={() => speak(phrase)}
              aria-label="Hear pronunciation"
              data-testid="produce-speak"
              className="grid h-8 w-8 place-items-center rounded-xl bg-white/70 text-ink hover:bg-white"
            >
              <Volume2 size={14} strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-sm italic text-ink-soft">&ldquo;{sentence}&rdquo;</p>
        </div>
      )}

      {checked && <GradeButtons onGrade={onGraded} />}
    </div>
  );
}
