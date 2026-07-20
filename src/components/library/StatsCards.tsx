"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Layers, Sparkles, Repeat2, Trophy } from "lucide-react";

function useCountUp(value: number, durationMs = 500) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      setDisplay(Math.round(from + (value - from) * progress));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
}

const CARDS = [
  { key: "total", label: "Total Words", icon: Layers, tint: "brand" },
  { key: "new", label: "New", icon: Sparkles, tint: "brand" },
  { key: "learning", label: "Learning", icon: Repeat2, tint: "mango" },
  { key: "learned", label: "Learned", icon: Trophy, tint: "leaf" },
] as const;

const TINT_STYLE: Record<string, string> = {
  brand: "bg-gradient-to-br from-brand/10 to-transparent text-brand-shadow",
  mango: "bg-gradient-to-br from-mango/10 to-transparent text-mango-shadow",
  leaf: "bg-gradient-to-br from-leaf/10 to-transparent text-leaf-shadow",
};

export function StatsCards({
  total,
  newCount,
  learning,
  learned,
}: {
  total: number;
  newCount: number;
  learning: number;
  learned: number;
}) {
  const values: Record<string, number> = { total, new: newCount, learning, learned };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="library-stats">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <StatCard
            key={card.key}
            label={card.label}
            value={values[card.key]}
            icon={Icon}
            className={TINT_STYLE[card.tint]}
          />
        );
      })}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  icon: typeof Layers;
  className: string;
}) {
  const display = useCountUp(value);

  return (
    <motion.div
      className={`rounded-3xl border-2 border-black/5 p-5 shadow-tactile shadow-black/5 ${className}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/70">
        <Icon size={16} strokeWidth={2.4} />
      </span>
      <p className="mt-3 font-display text-3xl font-bold text-ink">{display}</p>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">{label}</p>
    </motion.div>
  );
}
