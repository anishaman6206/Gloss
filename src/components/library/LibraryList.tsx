"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WordCard } from "./WordCard";
import { ConfirmDialog } from "./ConfirmDialog";
import { deleteWord } from "@/lib/actions";
import type { WordStatus } from "@/lib/types";

export type LibraryWord = {
  id: string;
  phrase: string;
  sentence: string;
  definition: string;
  partOfSpeech: string;
  synonyms: string[];
  examples: string[];
  status: WordStatus;
};

const UNDO_WINDOW_MS = 5000;

export function LibraryList({ initialWords }: { initialWords: LibraryWord[] }) {
  const [words, setWords] = useState(initialWords);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [undoWord, setUndoWord] = useState<{ word: LibraryWord; index: number } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordToDelete = words.find((w) => w.id === pendingDeleteId) ?? null;

  function confirmDelete() {
    if (!wordToDelete) return;
    const index = words.findIndex((w) => w.id === wordToDelete.id);
    setWords((ws) => ws.filter((w) => w.id !== wordToDelete.id));
    setPendingDeleteId(null);

    // Optimistic remove now; the server delete only actually fires once the
    // undo window closes, so hitting Undo never wastes a request.
    setUndoWord({ word: wordToDelete, index });
    undoTimer.current = setTimeout(() => {
      setUndoWord(null);
      deleteWord(wordToDelete.id);
    }, UNDO_WINDOW_MS);
  }

  function undo() {
    if (!undoWord) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    const { word, index } = undoWord;
    setWords((ws) => {
      const next = [...ws];
      next.splice(index, 0, word);
      return next;
    });
    setUndoWord(null);
  }

  return (
    <>
      <div className="space-y-3">
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
                onDelete={() => setPendingDeleteId(word.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={!!wordToDelete}
        title={`Delete "${wordToDelete?.phrase ?? ""}"?`}
        description="This removes it from your library. You can undo for a few seconds right after."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      <AnimatePresence>
        {undoWord && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-tactile shadow-black/40"
          >
            <span>Deleted &ldquo;{undoWord.word.phrase}&rdquo;</span>
            <button type="button" onClick={undo} className="font-bold text-brand underline">
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
