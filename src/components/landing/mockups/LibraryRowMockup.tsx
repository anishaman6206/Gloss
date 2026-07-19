const ROWS = [
  { word: "meander", def: "to follow a winding course", status: "New", style: "bg-brand/10 text-brand-shadow" },
  { word: "ephemeral", def: "lasting for a short time", status: "Learning", style: "bg-mango/15 text-mango-shadow" },
  { word: "resolute", def: "admirably firm and determined", status: "Learned", style: "bg-leaf/15 text-leaf-shadow" },
];

export function LibraryRowMockup({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`space-y-2 rounded-3xl border-2 border-black/5 bg-white p-4 shadow-tactile shadow-black/10 ${className}`}
    >
      {ROWS.map((r) => (
        <div
          key={r.word}
          className="flex items-center justify-between gap-2 rounded-2xl bg-black/[0.02] px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold">{r.word}</p>
            <p className="truncate text-[11px] text-ink-soft">{r.def}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${r.style}`}
          >
            {r.status}
          </span>
        </div>
      ))}
    </div>
  );
}
