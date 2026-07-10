"use client";

import { X, Meh, Check } from "lucide-react";
import type { ReviewQuality } from "@/lib/types";

export function GradeButtons({ onGrade }: { onGrade: (quality: ReviewQuality) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2" data-testid="grade-buttons">
      <button
        onClick={() => onGrade(1)}
        data-testid="grade-again"
        className="btn-tactile bg-cherry !py-3 !px-2 text-sm shadow-tactile shadow-cherry-shadow"
      >
        <X size={16} /> Again
      </button>
      <button
        onClick={() => onGrade(3)}
        data-testid="grade-hesitated"
        className="btn-tactile bg-mango !py-3 !px-2 text-sm shadow-tactile shadow-mango-shadow"
      >
        <Meh size={16} /> Hesitated
      </button>
      <button
        onClick={() => onGrade(5)}
        data-testid="grade-knew"
        className="btn-tactile bg-leaf !py-3 !px-2 text-sm shadow-tactile shadow-leaf-shadow"
      >
        <Check size={16} /> Knew it
      </button>
    </div>
  );
}
