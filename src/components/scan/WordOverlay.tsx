"use client";

import type { OcrWord } from "@/lib/types";

export function WordOverlay({
  words,
  width,
  height,
  selectedIds,
  onToggle,
}: {
  words: OcrWord[];
  width: number;
  height: number;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full">
      {words.map((word) => {
        const selected = selectedIds.has(word.id);
        return (
          <rect
            key={word.id}
            x={word.x0}
            y={word.y0}
            width={Math.max(word.x1 - word.x0, 1)}
            height={Math.max(word.y1 - word.y0, 1)}
            rx={4}
            className="cursor-pointer transition-colors"
            fill={selected ? "rgba(250, 204, 21, 0.45)" : "transparent"}
            stroke={selected ? "rgba(161, 98, 7, 0.85)" : "transparent"}
            strokeWidth={2}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(word.id);
            }}
          />
        );
      })}
    </svg>
  );
}
