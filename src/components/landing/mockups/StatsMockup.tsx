import { Flame } from "lucide-react";

const BARS = [30, 55, 40, 70, 50, 85, 65, 45, 90, 60, 75, 95, 55, 80];

export function StatsMockup({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-3xl border-2 border-black/5 bg-white p-4 shadow-tactile shadow-black/10 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
            Current streak
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 font-display text-2xl font-bold">
            <Flame size={18} className="text-mango" /> 12 days
          </p>
        </div>
        <span className="rounded-full bg-leaf/15 px-2.5 py-1 text-[10px] font-bold text-leaf-shadow">
          186 words learned
        </span>
      </div>

      <div className="mt-4 flex h-16 items-end gap-1">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={`flex-1 rounded-full ${
              i === BARS.length - 3 ? "bg-brand" : "bg-brand/20"
            }`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-faint">
        Last 14 days
      </p>
    </div>
  );
}
