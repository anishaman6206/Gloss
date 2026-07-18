"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Send,
  LogIn,
  Crown,
  ThumbsUp,
  Wand2,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { DescribeFeedback, DescribeFeedbackResult } from "@/lib/types";

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; data: DescribeFeedback }
  | { status: "error"; message: string; code?: string };

const MIN_LENGTH = 15;

export function PracticeMode({ imageId }: { imageId: string }) {
  const { user, login } = useAuth();
  const [description, setDescription] = useState("");
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setState({ status: "error", message: "Sign in to get feedback.", code: "unauthorized" });
      return;
    }
    if (description.trim().length < MIN_LENGTH) {
      setState({
        status: "error",
        message: "A little more detail first — try a full sentence or two.",
      });
      return;
    }

    setState({ status: "loading" });
    try {
      const res = await fetch("/api/describe/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, description: description.trim() }),
      });
      const result = (await res.json()) as DescribeFeedbackResult;
      if (result.ok) {
        setState({ status: "done", data: result.data });
      } else {
        setState({ status: "error", message: result.error, code: result.code });
      }
    } catch {
      setState({
        status: "error",
        message: "Couldn't reach the coach right now, try again in a moment.",
      });
    }
  }

  return (
    <div className="space-y-4" data-testid="practice-mode">
      <div className="space-y-3 rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-shadow">
          <Sparkles size={12} /> Your turn
        </span>
        <p className="text-ink-soft">
          Describe what you see in a few sentences. Try to use some of the scene&apos;s vocabulary.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="In this picture, I can see…"
            rows={5}
            data-testid="practice-textarea"
            className="w-full resize-none rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-3 text-base leading-relaxed outline-none focus:border-brand focus:bg-white"
          />
          <button
            type="submit"
            disabled={state.status === "loading"}
            data-testid="practice-submit"
            className="btn-tactile bg-brand shadow-tactile shadow-brand-shadow"
          >
            {state.status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Getting feedback…
              </>
            ) : (
              <>
                <Send size={16} /> Get feedback
              </>
            )}
          </button>
        </form>

        {state.status === "error" && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-cherry" data-testid="practice-error">
              {state.message}
            </p>
            {state.code === "unauthorized" && (
              <button
                onClick={login}
                data-testid="practice-login"
                className="btn-tactile bg-mango !py-2 !px-4 text-sm shadow-tactile shadow-mango-shadow"
              >
                <LogIn size={14} /> Sign in · 7 days free
              </button>
            )}
            {state.code === "subscription_required" && (
              <a
                href="/subscribe"
                data-testid="practice-subscribe"
                className="btn-tactile bg-mango !py-2 !px-4 text-sm shadow-tactile shadow-mango-shadow"
              >
                <Crown size={14} /> Subscribe to keep practicing
              </a>
            )}
            {!state.code && (
              <button
                onClick={handleSubmit}
                data-testid="practice-retry"
                className="btn-tactile bg-ink !py-2 !px-4 text-sm shadow-tactile shadow-black/40"
              >
                <RefreshCw size={14} /> Try again
              </button>
            )}
          </div>
        )}
      </div>

      {state.status === "done" && (
        <div className="reveal space-y-4">
          <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
            <p className="text-lg font-medium leading-relaxed">{state.data.overall}</p>
          </div>

          {state.data.strengths.length > 0 && (
            <div className="rounded-3xl border-2 border-black/5 bg-leaf/[0.08] p-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf-shadow">
                <ThumbsUp size={14} /> What worked
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-ink">
                {state.data.strengths.map((s, i) => (
                  <li key={i}>&bull; {s}</li>
                ))}
              </ul>
            </div>
          )}

          {state.data.improvements.length > 0 && (
            <div className="rounded-3xl border-2 border-black/5 bg-mango/[0.08] p-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mango-shadow">
                <Wand2 size={14} /> Polish these
              </p>
              <div className="mt-2 space-y-3">
                {state.data.improvements.map((imp, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-ink-faint line-through">{imp.original}</p>
                    <p className="font-bold text-ink">{imp.suggestion}</p>
                    <p className="text-ink-soft">{imp.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.data.missedDetails.length > 0 && (
            <div className="rounded-3xl border-2 border-black/5 bg-brand/[0.08] p-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-shadow">
                <Eye size={14} /> Things you could add
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-ink">
                {state.data.missedDetails.map((d, i) => (
                  <li key={i}>&bull; {d}</li>
                ))}
              </ul>
            </div>
          )}

          {state.data.vocabUsed.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                Vocab you used well
              </span>
              {state.data.vocabUsed.map((w, i) => (
                <span
                  key={i}
                  className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand-shadow"
                >
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
