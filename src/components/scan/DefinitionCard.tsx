"use client";

import { useState, useTransition } from "react";
import { saveWord } from "@/lib/actions";
import type { Definition, Term } from "@/lib/types";

export type LookupState =
  | { status: "loading" }
  | { status: "done"; data: Definition }
  | { status: "error"; message: string };

export function DefinitionCard({
  term,
  lookup,
  onRetry,
}: {
  term: Term;
  lookup: LookupState;
  onRetry: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const [isSaving, startSaving] = useTransition();

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-ink/50">{term.phrase}</p>

      {lookup.status === "loading" && <p className="mt-2 text-sm text-ink/60">Looking that up…</p>}

      {lookup.status === "error" && (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-ink/70">{lookup.message}</p>
          <button onClick={onRetry} className="rounded-full bg-ink px-3 py-1 text-sm text-paper">
            Try again
          </button>
        </div>
      )}

      {lookup.status === "done" && (
        <div className="mt-2 space-y-3">
          <p className="text-lg font-medium leading-snug">{lookup.data.definition}</p>
          <p className="text-sm italic text-ink/60">{lookup.data.partOfSpeech}</p>

          {lookup.data.synonyms.length > 0 && (
            <p className="text-sm text-ink/70">
              <span className="font-medium">Similar: </span>
              {lookup.data.synonyms.join(", ")}
            </p>
          )}

          {lookup.data.examples.length > 0 && (
            <ul className="space-y-1 text-sm text-ink/70">
              {lookup.data.examples.map((example, i) => (
                <li key={i}>&ldquo;{example}&rdquo;</li>
              ))}
            </ul>
          )}

          <button
            disabled={saved || isSaving}
            onClick={() => {
              const data = lookup.data;
              startSaving(async () => {
                await saveWord({ phrase: term.phrase, sentence: term.sentence, ...data });
                setSaved(true);
              });
            }}
            className="rounded-full bg-ink px-4 py-1.5 text-sm text-paper disabled:opacity-50"
          >
            {saved ? "Saved" : isSaving ? "Saving…" : "Save this word"}
          </button>
        </div>
      )}
    </div>
  );
}
