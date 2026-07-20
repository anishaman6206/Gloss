"use client";

import { useState } from "react";
import { ChevronDown, Volume2, Sparkles, Trash2, Pencil } from "lucide-react";
import { speak } from "@/lib/speak";
import { StatusBadge } from "./StatusBadge";
import { TagChip } from "./TagChip";
import { Highlight } from "./Highlight";
import type { WordStatus } from "@/lib/types";

export function WordCard({
  phrase,
  sentence,
  definition,
  partOfSpeech,
  synonyms,
  examples,
  status,
  isLeech,
  isCommon,
  tags,
  notes,
  query,
  onDelete,
  onEdit,
}: {
  phrase: string;
  sentence: string;
  definition: string;
  partOfSpeech: string;
  synonyms: string[];
  examples: string[];
  status: WordStatus;
  isLeech?: boolean;
  isCommon?: boolean;
  tags?: string[];
  notes?: string;
  query?: string;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-3xl border-2 border-black/5 bg-white p-4 shadow-tactile shadow-black/5 transition-shadow"
      data-testid={`word-card-${phrase}`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
        data-testid={`word-toggle-${phrase}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-display text-lg font-bold">
              <Highlight text={phrase} query={query ?? ""} />
            </p>
            <span
              onClick={(e) => {
                e.stopPropagation();
                speak(phrase);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  speak(phrase);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Hear ${phrase}`}
              data-testid={`speak-lib-${phrase}`}
              className="grid h-7 w-7 place-items-center rounded-lg bg-brand/10 text-brand hover:bg-brand/20"
            >
              <Volume2 size={13} />
            </span>
          </div>
          {!open && (
            <p className="truncate text-sm text-ink-soft">
              <Highlight text={definition} query={query ?? ""} />
            </p>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-1.5">
          {isCommon && (
            <span
              className="rounded-full bg-black/[0.05] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink-faint"
              data-testid={`common-badge-${phrase}`}
            >
              Everyday
            </span>
          )}
          {isLeech && (
            <span
              className="rounded-full bg-cherry/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cherry-shadow"
              data-testid={`leech-badge-${phrase}`}
            >
              Struggling
            </span>
          )}
          <StatusBadge status={status} />
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="reveal mt-3 space-y-3 border-t-2 border-black/5 pt-3 text-sm">
          <p className="text-base">{definition}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
            {partOfSpeech}
          </p>

          {synonyms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                Similar
              </span>
              {synonyms.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand-shadow"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {examples.length > 0 && (
            <ul className="space-y-1.5 rounded-2xl bg-mango/[0.08] p-3 text-ink-soft">
              {examples.map((ex, i) => (
                <li key={i} className="flex gap-2">
                  <Sparkles size={12} className="mt-1 shrink-0 text-mango" />
                  <span>&ldquo;{ex}&rdquo;</span>
                </li>
              ))}
            </ul>
          )}

          <p className="rounded-2xl bg-black/[0.03] p-3 text-xs text-ink-faint">
            From: &ldquo;{sentence}&rdquo;
          </p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </div>
          )}

          {notes && (
            <p className="rounded-2xl bg-leaf/[0.06] p-3 text-sm text-ink">{notes}</p>
          )}

          <div className="flex items-center gap-4">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                data-testid={`edit-word-${phrase}`}
                className="flex items-center gap-1.5 text-xs font-bold text-ink-soft hover:text-brand-shadow"
              >
                <Pencil size={13} /> Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                data-testid={`delete-word-${phrase}`}
                className="flex items-center gap-1.5 text-xs font-bold text-cherry hover:text-cherry-shadow"
              >
                <Trash2 size={13} /> Delete from library
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
