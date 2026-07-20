"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { TagChip } from "./TagChip";
import { Highlight } from "./Highlight";
import { ExpandableWordRow } from "./ExpandableWordRow";
import type { LibraryWord } from "@/lib/types";

const COLUMN_COUNT = 8; // checkbox, word, part of speech, meaning, status, tags, date, actions

export function WordTable({
  words,
  query,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteOne,
  onEditOne,
}: {
  words: LibraryWord[];
  query: string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDeleteOne: (id: string) => void;
  onEditOne: (word: LibraryWord) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const allSelected = words.length > 0 && words.every((w) => selectedIds.has(w.id));

  return (
    <div
      className="hidden overflow-hidden rounded-3xl border-2 border-black/5 bg-white shadow-tactile shadow-black/5 md:block"
      data-testid="word-table"
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-2 border-black/5 text-xs font-bold uppercase tracking-wider text-ink-faint">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="Select all words on this page"
                data-testid="select-all-checkbox"
              />
            </th>
            <th className="px-2 py-3">Word</th>
            <th className="hidden px-2 py-3 lg:table-cell">Part of speech</th>
            <th className="px-2 py-3">Meaning</th>
            <th className="px-2 py-3">Status</th>
            <th className="hidden px-2 py-3 lg:table-cell">Tags</th>
            <th className="hidden px-2 py-3 md:table-cell">Date added</th>
            <th className="px-2 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {words.map((word) => {
            const isOpen = openId === word.id;
            return (
              <Fragment key={word.id}>
                <tr
                  className="h-16 transition-colors hover:bg-black/[0.02]"
                  data-testid={`word-row-${word.phrase}`}
                >
                  <td className="px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(word.id)}
                      onChange={() => onToggleSelect(word.id)}
                      aria-label={`Select ${word.phrase}`}
                      data-testid={`select-${word.phrase}`}
                    />
                  </td>
                  <td className="max-w-[160px] truncate px-2 font-display font-bold">
                    <Highlight text={word.phrase} query={query} />
                  </td>
                  <td className="hidden px-2 text-ink-faint lg:table-cell">
                    {word.partOfSpeech}
                  </td>
                  <td className="max-w-[280px] truncate px-2 text-ink-soft">
                    <Highlight text={word.definition} query={query} />
                  </td>
                  <td className="px-2">
                    <StatusBadge status={word.status} />
                  </td>
                  <td className="hidden px-2 lg:table-cell">
                    <div className="flex flex-wrap items-center gap-1">
                      {word.tags.slice(0, 2).map((tag) => (
                        <TagChip key={tag} tag={tag} />
                      ))}
                      {word.tags.length > 2 && (
                        <span className="text-xs text-ink-faint">+{word.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-2 text-xs text-ink-faint md:table-cell">
                    {new Date(word.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-2 text-right">
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : word.id)}
                      aria-label={isOpen ? "Collapse row" : "Expand row"}
                      aria-expanded={isOpen}
                      data-testid={`toggle-row-${word.phrase}`}
                      className="grid h-8 w-8 place-items-center rounded-xl text-ink-faint hover:bg-black/[0.05]"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <ExpandableWordRow
                    word={word}
                    colSpan={COLUMN_COUNT}
                    onDelete={() => onDeleteOne(word.id)}
                    onEdit={() => onEditOne(word)}
                  />
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
