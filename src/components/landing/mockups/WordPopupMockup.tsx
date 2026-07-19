import { Volume2, Sparkles, BookmarkCheck } from "lucide-react";

const EXAMPLES = [
  "The old river seemed content to meander through the valley, in no hurry to reach the sea.",
  "During the lecture, his thoughts would meander far from the topic at hand.",
];

export function WordPopupMockup({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-3xl border-2 border-black/5 bg-white p-4 shadow-tactile shadow-black/10 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate font-display text-lg font-bold">meander</p>
          <span className="shrink-0 rounded-full bg-brand/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-brand-shadow">
            New
          </span>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
          <Volume2 size={14} strokeWidth={2.5} />
        </span>
      </div>

      <p className="mt-2 text-sm font-medium leading-snug text-ink">
        to follow a winding course, without hurry
      </p>
      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-faint">
        verb
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
          Similar
        </span>
        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand-shadow">
          wander
        </span>
        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand-shadow">
          drift
        </span>
        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand-shadow">
          roam
        </span>
      </div>

      <div className="mt-2.5 space-y-1.5 rounded-xl bg-mango/[0.08] p-2">
        {EXAMPLES.map((example) => (
          <div key={example} className="flex items-start gap-1.5 text-[11px] text-ink-soft">
            <Sparkles size={11} className="mt-0.5 shrink-0 text-mango" />
            <span>&ldquo;{example}&rdquo;</span>
          </div>
        ))}
      </div>

      <div className="btn-tactile mt-3 w-full !py-2 !px-3 bg-brand text-xs shadow-tactile shadow-brand-shadow">
        <BookmarkCheck size={13} /> Save to my library
      </div>
    </div>
  );
}
