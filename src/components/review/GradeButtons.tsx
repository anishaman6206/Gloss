"use client";

import { X, Meh, Check } from "lucide-react";
import type { ReviewQuality } from "@/lib/types";

export function GradeButtons({
  onGrade,
  suggested,
}: {
  onGrade: (quality: ReviewQuality) => void;
  // For modes with an objective right/wrong answer (fill-blank,
  // produce-word), the grade that matches what actually happened - shown as
  // a lightly emphasized default so grading is one tap instead of a re-judged
  // guess, but still fully overridable to "Hesitated" for partial credit.
  suggested?: ReviewQuality;
}) {
  const emphasis = (quality: ReviewQuality) =>
    suggested === quality ? "ring-2 ring-offset-2 ring-black/15 scale-[1.03]" : "";

  return (
    <div className="grid grid-cols-3 gap-2" data-testid="grade-buttons">
      <button
        onClick={() => onGrade(1)}
        data-testid="grade-again"
        className={`btn-tactile bg-cherry !py-3 !px-2 text-sm shadow-tactile shadow-cherry-shadow transition-transform ${emphasis(1)}`}
      >
        <X size={16} /> Again
      </button>
      <button
        onClick={() => onGrade(3)}
        data-testid="grade-hesitated"
        className={`btn-tactile bg-mango !py-3 !px-2 text-sm shadow-tactile shadow-mango-shadow transition-transform ${emphasis(3)}`}
      >
        <Meh size={16} /> Hesitated
      </button>
      <button
        onClick={() => onGrade(5)}
        data-testid="grade-knew"
        className={`btn-tactile bg-leaf !py-3 !px-2 text-sm shadow-tactile shadow-leaf-shadow transition-transform ${emphasis(5)}`}
      >
        <Check size={16} /> Knew it
      </button>
    </div>
  );
}
