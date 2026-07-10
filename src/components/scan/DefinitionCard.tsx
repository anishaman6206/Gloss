"use client";

import { useState, useTransition } from "react";
import { Sparkles, Volume2, BookmarkCheck, RefreshCw, Loader2, Crown, LogIn } from "lucide-react";
import { saveWord } from "@/lib/actions";
import { speak } from "@/lib/speak";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Definition, Term } from "@/lib/types";

export type LookupState =
  | { status: "loading" }
  | { status: "done"; data: Definition }
  | { status: "error"; message: string };

type SaveError = "auth" | "subscription" | string | null;

export function DefinitionCard({
  term,
  lookup,
  onRetry,
}: {
  term: Term;
  lookup: LookupState;
  onRetry: () => void;
}) {
  const { user, login } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<SaveError>(null);
  const [isSaving, startSaving] = useTransition();

  const handleSave = () => {
    if (lookup.status !== "done") return;
    if (!user) {
      setError("auth");
      return;
    }
    const data = lookup.data;
    setError(null);
    startSaving(async () => {
      const res = await saveWord({
        phrase: term.phrase,
        sentence: term.sentence,
        ...data,
      });
      if (res.ok) setSaved(true);
      else if (res.error === "subscription_required") setError("subscription");
      else if (res.error === "unauthorized") setError("auth");
      else setError("Couldn't save that. Try again.");
    });
  };

  return (
    <div
      className="reveal rounded-3xl border-2 border-black/5 bg-white p-5 shadow-tactile shadow-black/5"
      data-testid={`definition-card-${term.phrase}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 font-display text-xl font-bold">{term.phrase}</p>
        <button
          type="button"
          onClick={() => speak(term.phrase)}
          data-testid={`speak-${term.phrase}`}
          aria-label={`Hear ${term.phrase}`}
          className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand transition-colors hover:bg-brand/20"
        >
          <Volume2 size={16} strokeWidth={2.5} />
        </button>
      </div>

      {lookup.status === "loading" && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 size={14} className="animate-spin" /> Looking that up…
        </p>
      )}

      {lookup.status === "error" && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-ink-soft">{lookup.message}</p>
          <button
            onClick={onRetry}
            data-testid="definition-retry"
            className="btn-tactile bg-ink !py-2 !px-4 text-sm shadow-tactile shadow-black/40"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      )}

      {lookup.status === "done" && (
        <div className="mt-3 space-y-3">
          <p className="text-lg font-medium leading-snug">{lookup.data.definition}</p>
          <p className="text-sm font-bold uppercase tracking-wider text-ink-faint">
            {lookup.data.partOfSpeech}
          </p>

          {lookup.data.synonyms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                Similar
              </span>
              {lookup.data.synonyms.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand-shadow"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {lookup.data.examples.length > 0 && (
            <ul className="space-y-1.5 rounded-2xl bg-mango/[0.08] p-3 text-sm text-ink-soft">
              {lookup.data.examples.map((example, i) => (
                <li key={i} className="flex gap-2">
                  <Sparkles size={12} className="mt-1 shrink-0 text-mango" />
                  <span>&ldquo;{example}&rdquo;</span>
                </li>
              ))}
            </ul>
          )}

          <button
            disabled={saved || isSaving}
            onClick={handleSave}
            data-testid={`save-word-${term.phrase}`}
            className={`btn-tactile ${
              saved
                ? "bg-leaf shadow-tactile shadow-leaf-shadow"
                : "bg-brand shadow-tactile shadow-brand-shadow"
            }`}
          >
            <BookmarkCheck size={16} />
            {saved ? "Saved to library" : isSaving ? "Saving…" : "Save to my library"}
          </button>

          {error === "auth" && (
            <button
              onClick={login}
              data-testid="save-error-login"
              className="btn-tactile bg-mango !py-2.5 !px-4 text-sm shadow-tactile shadow-mango-shadow"
            >
              <LogIn size={14} /> Sign in to save · 7 days free
            </button>
          )}
          {error === "subscription" && (
            <a
              href="/subscribe"
              data-testid="save-error-subscribe"
              className="btn-tactile bg-mango !py-2.5 !px-4 text-sm shadow-tactile shadow-mango-shadow"
            >
              <Crown size={14} /> Your trial ended — subscribe to keep saving
            </a>
          )}
          {error && error !== "auth" && error !== "subscription" && (
            <p className="text-sm font-bold text-cherry" data-testid="save-error">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
