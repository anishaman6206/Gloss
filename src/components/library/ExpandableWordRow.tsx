"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Volume2, Sparkles, Trash2, Pencil, Repeat2, Check, X, Meh } from "lucide-react";
import { TagChip } from "./TagChip";
import { speak } from "@/lib/speak";
import { bulkSetDueNow } from "@/lib/actions";
import type { LibraryWord } from "@/lib/types";

const QUALITY_ICON: Record<number, { icon: typeof Check; className: string }> = {
  0: { icon: X, className: "text-cherry" },
  1: { icon: X, className: "text-cherry" },
  2: { icon: X, className: "text-cherry" },
  3: { icon: Meh, className: "text-mango-shadow" },
  4: { icon: Check, className: "text-leaf-shadow" },
  5: { icon: Check, className: "text-leaf-shadow" },
};

export function ExpandableWordRow({
  word,
  onDelete,
  onEdit,
  colSpan,
}: {
  word: LibraryWord;
  onDelete: () => void;
  onEdit: () => void;
  colSpan: number;
}) {
  const router = useRouter();
  const [reviewing, setReviewing] = useState(false);

  async function reviewNow() {
    setReviewing(true);
    await bulkSetDueNow([word.id]);
    router.push("/review");
  }

  return (
    <tr data-testid={`word-detail-${word.phrase}`}>
      <td colSpan={colSpan} className="border-t-2 border-black/5 bg-black/[0.015] p-0">
        <div className="reveal space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="font-display text-xl font-bold">{word.phrase}</p>
              <button
                type="button"
                onClick={() => speak(word.phrase)}
                aria-label={`Hear ${word.phrase}`}
                data-testid={`speak-row-${word.phrase}`}
                className="grid h-8 w-8 place-items-center rounded-xl bg-brand/10 text-brand hover:bg-brand/20"
              >
                <Volume2 size={14} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={reviewNow}
                disabled={reviewing}
                data-testid={`review-now-${word.phrase}`}
                className="btn-tactile !py-2 !px-3.5 text-xs bg-leaf shadow-tactile shadow-leaf-shadow disabled:opacity-60"
              >
                <Repeat2 size={13} /> Review Now
              </button>
              <button
                type="button"
                onClick={onEdit}
                data-testid={`edit-word-${word.phrase}`}
                className="btn-tactile !py-2 !px-3.5 text-xs !bg-white !text-ink border-2 border-black/10 shadow-tactile shadow-black/10"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                data-testid={`delete-word-${word.phrase}`}
                className="btn-tactile !py-2 !px-3.5 text-xs bg-cherry shadow-tactile shadow-cherry-shadow"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>

          <p className="text-base">{word.definition}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
            {word.partOfSpeech}
          </p>

          {word.synonyms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                Similar
              </span>
              {word.synonyms.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand-shadow"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {word.examples.length > 0 && (
            <ul className="space-y-1.5 rounded-2xl bg-mango/[0.08] p-3 text-ink-soft">
              {word.examples.map((ex, i) => (
                <li key={i} className="flex gap-2">
                  <Sparkles size={12} className="mt-1 shrink-0 text-mango" />
                  <span>&ldquo;{ex}&rdquo;</span>
                </li>
              ))}
            </ul>
          )}

          <p className="rounded-2xl bg-black/[0.03] p-3 text-xs text-ink-faint">
            From: &ldquo;{word.sentence}&rdquo;
          </p>

          {word.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {word.tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </div>
          )}

          {word.notes && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                Notes
              </span>
              <p className="mt-1 whitespace-pre-wrap rounded-2xl bg-leaf/[0.06] p-3 text-sm text-ink">
                {word.notes}
              </p>
            </div>
          )}

          {word.reviewHistory.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                Review history
              </span>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {word.reviewHistory.map((entry, i) => {
                  const { icon: Icon, className } = QUALITY_ICON[entry.quality] ?? QUALITY_ICON[3];
                  return (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow-tactile shadow-black/5 ${className}`}
                    >
                      <Icon size={11} />
                      {new Date(entry.reviewedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
