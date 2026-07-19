"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/10"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <h2 className="font-display text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-ink-soft">{description}</p>
            <div className="mt-5 flex gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-2xl border-2 border-black/10 py-2.5 text-sm font-bold text-ink-soft"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                data-testid="confirm-delete"
                className="flex-1 rounded-2xl bg-cherry py-2.5 text-sm font-bold text-white shadow-tactile shadow-cherry-shadow"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
