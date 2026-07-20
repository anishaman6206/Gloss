"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WordCard } from "./WordCard";
import { WordTable } from "./WordTable";
import { ConfirmDialog } from "./ConfirmDialog";
import { EditWordModal } from "./EditWordModal";
import { BulkActionsToolbar } from "./BulkActionsToolbar";
import { Pagination } from "./Pagination";
import {
  bulkDeleteWords,
  bulkAddTag,
  bulkMarkLearned,
  bulkResetProgress,
  bulkSetDueNow,
} from "@/lib/actions";
import type { LibraryWord } from "@/lib/types";

const UNDO_WINDOW_MS = 5000;

export function LibraryDashboard({
  initialWords,
  query,
  page,
  pageSize,
  totalMatching,
}: {
  initialWords: LibraryWord[];
  query: string;
  page: number;
  pageSize: number;
  totalMatching: number;
}) {
  const [words, setWords] = useState(initialWords);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null);
  const [undoBatch, setUndoBatch] = useState<{ count: number; snapshot: LibraryWord[] } | null>(
    null
  );
  const [editingWord, setEditingWord] = useState<LibraryWord | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalMatching / pageSize));
  const selectedWords = words.filter((w) => selectedIds.has(w.id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (words.every((w) => prev.has(w.id))) return new Set();
      return new Set(words.map((w) => w.id));
    });
  }

  function requestDelete(ids: string[]) {
    setPendingDeleteIds(ids);
  }

  function confirmDelete() {
    if (!pendingDeleteIds) return;
    const ids = pendingDeleteIds;
    const snapshot = words;
    setWords((ws) => ws.filter((w) => !ids.includes(w.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setPendingDeleteIds(null);

    setUndoBatch({ count: ids.length, snapshot });
    undoTimer.current = setTimeout(() => {
      setUndoBatch(null);
      bulkDeleteWords(ids);
    }, UNDO_WINDOW_MS);
  }

  function undo() {
    if (!undoBatch) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setWords(undoBatch.snapshot);
    setUndoBatch(null);
  }

  async function handleAddTag(tag: string) {
    const ids = Array.from(selectedIds);
    await bulkAddTag(ids, tag);
    setWords((ws) =>
      ws.map((w) => (ids.includes(w.id) && !w.tags.includes(tag) ? { ...w, tags: [...w.tags, tag] } : w))
    );
    setSelectedIds(new Set());
  }

  async function handleMarkLearned() {
    const ids = Array.from(selectedIds);
    await bulkMarkLearned(ids);
    setWords((ws) => ws.map((w) => (ids.includes(w.id) ? { ...w, status: "learned" as const } : w)));
    setSelectedIds(new Set());
  }

  async function handleResetProgress() {
    const ids = Array.from(selectedIds);
    await bulkResetProgress(ids);
    setWords((ws) => ws.map((w) => (ids.includes(w.id) ? { ...w, status: "new" as const } : w)));
    setSelectedIds(new Set());
  }

  async function handleMoveToReview() {
    const ids = Array.from(selectedIds);
    await bulkSetDueNow(ids);
    setSelectedIds(new Set());
  }

  function handleSaved(wordId: string, tags: string[], notes: string) {
    setWords((ws) => ws.map((w) => (w.id === wordId ? { ...w, tags, notes } : w)));
  }

  const deleteTarget =
    pendingDeleteIds && pendingDeleteIds.length === 1
      ? words.find((w) => w.id === pendingDeleteIds[0])
      : null;

  return (
    <>
      <WordTable
        words={words}
        query={query}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onDeleteOne={(id) => requestDelete([id])}
        onEditOne={setEditingWord}
      />

      <div className="space-y-3 md:hidden">
        <AnimatePresence initial={false}>
          {words.map((word) => (
            <motion.div
              key={word.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, height: 0, marginBottom: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <WordCard
                phrase={word.phrase}
                sentence={word.sentence}
                definition={word.definition}
                partOfSpeech={word.partOfSpeech}
                synonyms={word.synonyms}
                examples={word.examples}
                status={word.status}
                isLeech={word.isLeech}
                isCommon={word.isCommon}
                tags={word.tags}
                notes={word.notes}
                query={query}
                onDelete={() => requestDelete([word.id])}
                onEdit={() => setEditingWord(word)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="pt-2">
        <Pagination page={page} totalPages={totalPages} />
      </div>

      <ConfirmDialog
        open={!!pendingDeleteIds}
        title={
          pendingDeleteIds && pendingDeleteIds.length > 1
            ? `Delete ${pendingDeleteIds.length} words?`
            : `Delete "${deleteTarget?.phrase ?? ""}"?`
        }
        description="This removes them from your library. You can undo for a few seconds right after."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteIds(null)}
      />

      <EditWordModal word={editingWord} onClose={() => setEditingWord(null)} onSaved={handleSaved} />

      <BulkActionsToolbar
        selectedWords={selectedWords}
        onRequestDelete={() => requestDelete(Array.from(selectedIds))}
        onAddTag={handleAddTag}
        onMarkLearned={handleMarkLearned}
        onResetProgress={handleResetProgress}
        onMoveToReview={handleMoveToReview}
        onClear={() => setSelectedIds(new Set())}
      />

      <AnimatePresence>
        {undoBatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-20 z-50 mx-auto flex w-fit items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-tactile shadow-black/40"
          >
            <span>
              Deleted {undoBatch.count} {undoBatch.count === 1 ? "word" : "words"}
            </span>
            <button type="button" onClick={undo} className="font-bold text-brand underline">
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
