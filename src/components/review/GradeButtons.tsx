"use client";

import type { ReviewQuality } from "@/lib/types";

export function GradeButtons({ onGrade }: { onGrade: (quality: ReviewQuality) => void }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onGrade(1)}
        className="flex-1 rounded-full border border-ink/15 px-3 py-2 text-sm hover:bg-ink/5"
      >
        Didn&apos;t know it
      </button>
      <button
        onClick={() => onGrade(3)}
        className="flex-1 rounded-full border border-ink/15 px-3 py-2 text-sm hover:bg-ink/5"
      >
        Hesitated
      </button>
      <button
        onClick={() => onGrade(5)}
        className="flex-1 rounded-full bg-ink px-3 py-2 text-sm text-paper"
      >
        Knew it
      </button>
    </div>
  );
}
