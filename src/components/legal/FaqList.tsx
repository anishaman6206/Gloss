"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqList({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3" data-testid="faq-list">
      {items.map((item, i) => {
        const isOpen = open === i;

        return (
          <div
            key={i}
            className="rounded-3xl border-2 border-black/5 bg-white shadow-tactile shadow-black/5"
            data-testid={`faq-item-${i}`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-3 p-5 text-left"
              data-testid={`faq-toggle-${i}`}
              aria-expanded={isOpen}
            >
              <span className="font-display text-lg font-bold">
                {item.q}
              </span>

              <ChevronDown
                size={18}
                className={`shrink-0 text-ink-faint transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="reveal border-t-2 border-black/5 px-5 pb-5 pt-4 text-ink-soft">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}