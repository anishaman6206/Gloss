"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Tag, Download, Repeat2, GraduationCap, RotateCcw, X } from "lucide-react";
import { toCsv } from "@/lib/csv";
import type { LibraryWord } from "@/lib/types";

export function BulkActionsToolbar({
  selectedWords,
  onRequestDelete,
  onAddTag,
  onMarkLearned,
  onResetProgress,
  onMoveToReview,
  onClear,
}: {
  selectedWords: LibraryWord[];
  onRequestDelete: () => void;
  onAddTag: (tag: string) => void;
  onMarkLearned: () => void;
  onResetProgress: () => void;
  onMoveToReview: () => void;
  onClear: () => void;
}) {
  const [tagPrompt, setTagPrompt] = useState(false);
  const [tagValue, setTagValue] = useState("");
  const [statusPrompt, setStatusPrompt] = useState(false);

  function exportSelected() {
    const rows = selectedWords.map((w) => [
      w.phrase,
      w.definition,
      w.partOfSpeech,
      w.sentence,
      w.synonyms.join("; "),
      w.tags.join("; "),
    ]);
    const csv = toCsv([["Phrase", "Definition", "Part of Speech", "Sentence", "Synonyms", "Tags"], ...rows]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gloss-words.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AnimatePresence>
      {selectedWords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[95vw] flex-wrap items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-tactile shadow-black/40"
          data-testid="bulk-actions-toolbar"
        >
          <span className="font-bold">{selectedWords.length} selected</span>

          <button
            type="button"
            onClick={onRequestDelete}
            data-testid="bulk-delete"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-bold hover:bg-white/20"
          >
            <Trash2 size={13} /> Delete
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusPrompt((v) => !v)}
              data-testid="bulk-change-status"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-bold hover:bg-white/20"
            >
              <GraduationCap size={13} /> Change Status
            </button>
            {statusPrompt && (
              <div className="absolute bottom-full left-0 mb-2 w-44 overflow-hidden rounded-2xl border-2 border-black/5 bg-white text-ink shadow-tactile shadow-black/10">
                <button
                  type="button"
                  onClick={() => {
                    onMarkLearned();
                    setStatusPrompt(false);
                  }}
                  data-testid="bulk-mark-learned"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-bold hover:bg-black/[0.03]"
                >
                  <GraduationCap size={13} className="text-leaf-shadow" /> Mark as Learned
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setStatusPrompt(false);
                  }}
                  data-testid="bulk-reset-progress"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-bold hover:bg-black/[0.03]"
                >
                  <RotateCcw size={13} className="text-brand-shadow" /> Reset Progress
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            {tagPrompt ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (tagValue.trim()) onAddTag(tagValue.trim());
                  setTagValue("");
                  setTagPrompt(false);
                }}
                className="flex items-center gap-1"
              >
                <input
                  autoFocus
                  value={tagValue}
                  onChange={(e) => setTagValue(e.target.value)}
                  placeholder="Tag name…"
                  data-testid="bulk-tag-input"
                  className="w-28 rounded-lg bg-white/10 px-2 py-1.5 text-xs text-white placeholder:text-white/50 outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-white/10 px-2 py-1.5 text-xs font-bold hover:bg-white/20"
                >
                  Add
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setTagPrompt(true)}
                data-testid="bulk-add-tag"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-bold hover:bg-white/20"
              >
                <Tag size={13} /> Add Tag
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={exportSelected}
            data-testid="bulk-export"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-bold hover:bg-white/20"
          >
            <Download size={13} /> Export
          </button>

          <button
            type="button"
            onClick={onMoveToReview}
            data-testid="bulk-move-to-review"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-bold hover:bg-white/20"
          >
            <Repeat2 size={13} /> Move to Review
          </button>

          <button
            type="button"
            onClick={onClear}
            aria-label="Clear selection"
            data-testid="bulk-clear"
            className="grid h-7 w-7 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
