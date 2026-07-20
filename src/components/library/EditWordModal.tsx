"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { TagChip } from "./TagChip";
import { updateWord } from "@/lib/actions";
import type { LibraryWord } from "@/lib/types";

export function EditWordModal({
  word,
  onClose,
  onSaved,
}: {
  word: LibraryWord | null;
  onClose: () => void;
  onSaved: (wordId: string, tags: string[], notes: string) => void;
}) {
  const [tags, setTags] = useState<string[]>(word?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState(word?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!word) return;
    setTags(word.tags);
    setNotes(word.notes);
    setTagInput("");
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.id]);

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) setTags((t) => [...t, trimmed]);
    setTagInput("");
  }

  async function save() {
    if (!word) return;
    setSaving(true);
    const result = await updateWord(word.id, { tags, notes });
    setSaving(false);
    if (result.ok) {
      onSaved(word.id, tags, notes);
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {word && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${word.phrase}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/10"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            data-testid="edit-word-modal"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Edit &ldquo;{word.phrase}&rdquo;</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-xl text-ink-faint hover:bg-black/[0.04]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                  Tags
                </label>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {tags.map((tag) => (
                    <TagChip key={tag} tag={tag} onRemove={() => setTags((t) => t.filter((x) => x !== tag))} />
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add a tag…"
                    data-testid="edit-tag-input"
                    className="min-w-[100px] flex-1 rounded-full border-2 border-transparent bg-black/[0.04] px-3 py-1 text-xs font-medium outline-none focus:border-brand focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a personal note about this word…"
                  rows={3}
                  data-testid="edit-notes-input"
                  className="mt-1.5 w-full rounded-2xl border-2 border-transparent bg-black/[0.04] p-3 text-sm outline-none focus:border-brand focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border-2 border-black/10 py-2.5 text-sm font-bold text-ink-soft"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                data-testid="save-edit-word"
                className="flex-1 rounded-2xl bg-brand py-2.5 text-sm font-bold text-white shadow-tactile shadow-brand-shadow disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
