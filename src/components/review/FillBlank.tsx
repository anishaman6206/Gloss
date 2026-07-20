"use client";

import { useState } from "react";
import { Volume2, Check, Lightbulb } from "lucide-react";
import { GradeButtons } from "./GradeButtons";
import { speak } from "@/lib/speak";
import { buildHint } from "@/lib/review";
import type { ReviewQuality } from "@/lib/types";

export function FillBlank({
  blanked,
  phrase,
  definition,
  onGraded,
}: {
  blanked: string;
  phrase: string;
  definition: string;
  onGraded: (quality: ReviewQuality) => void;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const correct = value.trim().toLowerCase() === phrase.trim().toLowerCase();

  return (
    <div
      className="space-y-4 rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
      data-testid="fill-blank"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-mango/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-mango-shadow">
        Fill in the blank
      </span>
      <p className="text-xl leading-relaxed">{blanked}</p>

      {!checked ? (
        <>
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
              placeholder="Type the missing word…"
              data-testid="fill-blank-input"
              className="flex-1 rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-3 text-base font-medium outline-none focus:border-brand focus:bg-white"
            />
            <button
              type="submit"
              data-testid="fill-blank-check"
              className="btn-tactile bg-brand !py-3 !px-5 shadow-tactile shadow-brand-shadow"
            >
              <Check size={16} /> Check
            </button>
          </form>

          {showHint ? (
            <p
              className="font-display text-lg font-bold tracking-[0.2em] text-mango-shadow"
              data-testid="fill-blank-hint"
            >
              {buildHint(phrase)}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              data-testid="fill-blank-hint-button"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-faint hover:text-mango-shadow"
            >
              <Lightbulb size={14} /> Show hint
            </button>
          )}
        </>
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
              data-testid="fill-blank-speak"
              className="grid h-8 w-8 place-items-center rounded-xl bg-white/70 text-ink hover:bg-white"
            >
              <Volume2 size={14} strokeWidth={2.5} />
            </button>
          </div>
          <p>{definition}</p>
        </div>
      )}

      {checked && <GradeButtons onGrade={onGraded} suggested={correct ? 5 : 1} />}
    </div>
  );
}
