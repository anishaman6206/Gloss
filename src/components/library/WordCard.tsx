"use client";

import { useState } from "react";
import type { WordStatus } from "@/lib/types";

const STATUS_LABEL: Record<WordStatus, string> = {
  new: "New",
  learning: "Learning",
  learned: "Learned",
};

const STATUS_STYLE: Record<WordStatus, string> = {
  new: "bg-ink/10 text-ink/70",
  learning: "bg-amber-200/60 text-amber-900",
  learned: "bg-emerald-200/60 text-emerald-900",
};

export function WordCard({
  phrase,
  sentence,
  definition,
  partOfSpeech,
  synonyms,
  examples,
  status,
}: {
  phrase: string;
  sentence: string;
  definition: string;
  partOfSpeech: string;
  synonyms: string[];
  examples: string[];
  status: WordStatus;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-4 shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="font-medium">{phrase}</p>
          {!open && <p className="truncate text-sm text-ink/60">{definition}</p>}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-ink/10 pt-3 text-sm">
          <p className="text-base">{definition}</p>
          <p className="italic text-ink/60">{partOfSpeech}</p>

          {synonyms.length > 0 && (
            <p>
              <span className="font-medium">Similar: </span>
              {synonyms.join(", ")}
            </p>
          )}

          {examples.length > 0 && (
            <ul className="space-y-1 text-ink/70">
              {examples.map((ex, i) => (
                <li key={i}>&ldquo;{ex}&rdquo;</li>
              ))}
            </ul>
          )}

          <p className="text-ink/50">From: &ldquo;{sentence}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
