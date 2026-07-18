"use client";

import { useState, useTransition } from "react";
import { Volume2, BookmarkPlus, BookmarkCheck, X, LogIn, Crown } from "lucide-react";
import { saveWord } from "@/lib/actions";
import { speak } from "@/lib/speak";
import { useAuth } from "@/components/auth/AuthProvider";
import type { DescribeVocabItem } from "@/lib/types";

type ItemState = "pending" | "saving" | "saved" | "skipped";
type ItemError = "auth" | "subscription" | null;

export function VocabAddList({
  vocab,
  sentences,
}: {
  vocab: DescribeVocabItem[];
  sentences: string[];
}) {
  const { user, login } = useAuth();
  const [states, setStates] = useState<Record<string, ItemState>>({});
  const [errors, setErrors] = useState<Record<string, ItemError>>({});
  const [, startTransition] = useTransition();

  const stateOf = (phrase: string): ItemState => states[phrase] ?? "pending";

  function handleAdd(item: DescribeVocabItem) {
    if (!user) {
      setErrors((e) => ({ ...e, [item.phrase]: "auth" }));
      return;
    }
    setErrors((e) => ({ ...e, [item.phrase]: null }));
    setStates((s) => ({ ...s, [item.phrase]: "saving" }));
    startTransition(async () => {
      const res = await saveWord({
        phrase: item.phrase,
        sentence: sentences[item.sentenceIndex] ?? item.examples[0] ?? "",
        definition: item.definition,
        partOfSpeech: item.partOfSpeech,
        synonyms: item.synonyms,
        examples: item.examples,
        source: "describe",
      });
      if (res.ok) {
        setStates((s) => ({ ...s, [item.phrase]: "saved" }));
      } else {
        setStates((s) => ({ ...s, [item.phrase]: "pending" }));
        setErrors((e) => ({
          ...e,
          [item.phrase]: res.error === "subscription_required" ? "subscription" : "auth",
        }));
      }
    });
  }

  function handleSkip(phrase: string) {
    setStates((s) => ({ ...s, [phrase]: "skipped" }));
  }

  const savedCount = vocab.filter((v) => stateOf(v.phrase) === "saved").length;
  const allResolved = vocab.every((v) => stateOf(v.phrase) !== "pending");

  return (
    <div className="space-y-4" data-testid="vocab-add-list">
      <div className="text-center">
        <p className="font-display text-2xl font-bold tracking-tight">New words from this scene</p>
        <p className="mt-1 text-ink-soft">
          {savedCount > 0
            ? `${savedCount} added to your library so far.`
            : "Add the ones worth remembering, skip the rest."}
        </p>
      </div>

      <div className="space-y-3">
        {vocab.map((item) => {
          const state = stateOf(item.phrase);
          if (state === "skipped") return null;
          const error = errors[item.phrase] ?? null;

          return (
            <div
              key={item.phrase}
              className="reveal rounded-3xl border-2 border-black/5 bg-white p-5 shadow-tactile shadow-black/5"
              data-testid={`describe-vocab-${item.phrase}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 font-display text-xl font-bold">{item.phrase}</p>
                <button
                  type="button"
                  onClick={() => speak(item.phrase)}
                  aria-label={`Hear ${item.phrase}`}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand transition-colors hover:bg-brand/20"
                >
                  <Volume2 size={16} strokeWidth={2.5} />
                </button>
              </div>

              <p className="mt-2 text-lg font-medium leading-snug">{item.definition}</p>
              <p className="mt-1 text-sm font-bold uppercase tracking-wider text-ink-faint">
                {item.partOfSpeech}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  disabled={state === "saving" || state === "saved"}
                  onClick={() => handleAdd(item)}
                  data-testid={`describe-vocab-add-${item.phrase}`}
                  className={`btn-tactile !py-2.5 !px-4 text-sm ${
                    state === "saved"
                      ? "bg-leaf shadow-tactile shadow-leaf-shadow"
                      : "bg-brand shadow-tactile shadow-brand-shadow"
                  }`}
                >
                  {state === "saved" ? (
                    <>
                      <BookmarkCheck size={14} /> Added
                    </>
                  ) : (
                    <>
                      <BookmarkPlus size={14} /> {state === "saving" ? "Adding…" : "Add to library"}
                    </>
                  )}
                </button>
                {state !== "saved" && (
                  <button
                    onClick={() => handleSkip(item.phrase)}
                    data-testid={`describe-vocab-skip-${item.phrase}`}
                    className="inline-flex items-center gap-1 text-sm font-bold text-ink-faint hover:text-cherry"
                  >
                    <X size={14} /> Skip
                  </button>
                )}
              </div>

              {error === "auth" && (
                <button
                  onClick={login}
                  data-testid={`describe-vocab-login-${item.phrase}`}
                  className="btn-tactile mt-3 bg-mango !py-2 !px-4 text-sm shadow-tactile shadow-mango-shadow"
                >
                  <LogIn size={14} /> Sign in to save · 7 days free
                </button>
              )}
              {error === "subscription" && (
                <a
                  href="/subscribe"
                  data-testid={`describe-vocab-subscribe-${item.phrase}`}
                  className="btn-tactile mt-3 bg-mango !py-2 !px-4 text-sm shadow-tactile shadow-mango-shadow"
                >
                  <Crown size={14} /> Your trial ended, subscribe to keep saving
                </a>
              )}
            </div>
          );
        })}
      </div>

      {allResolved && vocab.length > 0 && (
        <div className="reveal rounded-3xl border-2 border-dashed border-black/10 bg-white p-6 text-center">
          <p className="font-display text-lg font-bold">
            {savedCount > 0 ? "Nice — that's more vocab in the bank." : "All clear."}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            You can always come back and describe this scene again.
          </p>
        </div>
      )}
    </div>
  );
}
