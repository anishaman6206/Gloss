"use client";

import { useState } from "react";
import { GradeButtons } from "./GradeButtons";
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

  const correct = value.trim().toLowerCase() === phrase.trim().toLowerCase();

  return (
    <div className="space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-6">
      <p className="text-xs uppercase tracking-wide text-ink/50">Fill in the blank</p>
      <p className="text-lg leading-relaxed">{blanked}</p>

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
            placeholder="Type the missing word…"
            className="flex-1 rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm outline-none focus:border-ink/40"
          />
          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm text-paper">
            Check
          </button>
        </form>
      ) : (
        <div className="space-y-3 rounded-xl bg-ink/5 p-4">
          <p className={correct ? "font-medium text-emerald-700" : "font-medium"}>
            {correct ? "Correct — " : "It was — "}
            {phrase}
          </p>
          <p>{definition}</p>
        </div>
      )}

      {checked && <GradeButtons onGrade={onGraded} />}
    </div>
  );
}
