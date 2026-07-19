export function OCRScanMockup({ className = "" }: { className?: string }) {
  const lines = [92, 78, 85, 60, 88, 70];

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-3xl border-2 border-black/5 bg-ink p-4 shadow-tactile shadow-black/20 ${className}`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white/95 p-4">
        <div className="space-y-2">
          {lines.map((w, i) => (
            <div
              key={i}
              className="flex flex-wrap gap-1.5"
              style={{ width: `${w}%` }}
            >
              {Array.from({ length: 3 }).map((_, j) => (
                <span
                  key={j}
                  className={`h-2.5 rounded-full ${
                    i === 2 && j === 1
                      ? "bg-brand/70 ring-2 ring-brand/40"
                      : "bg-black/10"
                  }`}
                  style={{ width: `${18 + ((i + j) % 4) * 8}%` }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Scanning laser */}
        <div className="pointer-events-none absolute inset-x-0 h-full">
          <div className="absolute left-0 right-0 h-0.5 animate-laser bg-brand shadow-[0_0_12px_2px_rgba(28,176,246,0.6)]" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/70">
        <span>Scanning page…</span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-leaf" /> On-device OCR
        </span>
      </div>
    </div>
  );
}
