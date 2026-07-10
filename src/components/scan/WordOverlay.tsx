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
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 h-full w-full"
      data-testid="word-overlay"
    >
      {words.map((word) => {
        const selected = selectedIds.has(word.id);
        return (
          <rect
            key={word.id}
            x={word.x0}
            y={word.y0}
            width={Math.max(word.x1 - word.x0, 1)}
            height={Math.max(word.y1 - word.y0, 1)}
            rx={6}
            className="cursor-pointer transition-all"
            fill={selected ? "rgba(255, 150, 0, 0.5)" : "rgba(28, 176, 246, 0.06)"}
            stroke={selected ? "#CC7800" : "rgba(28, 176, 246, 0.35)"}
            strokeWidth={selected ? 3 : 1.5}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(word.id);
            }}
            data-testid={`word-rect-${word.id}`}
          />
        );
      })}
    </svg>
  );
}
