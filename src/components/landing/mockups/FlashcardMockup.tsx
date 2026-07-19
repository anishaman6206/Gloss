import { Eye } from "lucide-react";

export function FlashcardMockup({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`space-y-3 rounded-3xl border-2 border-black/5 bg-white p-5 shadow-tactile shadow-black/10 ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-shadow">
        Recall the meaning
      </span>

      <p className="text-sm leading-relaxed text-ink">
        With the rain tapping at the window, her thoughts began to{" "}
        <span className="rounded-md bg-mango/40 px-1 font-bold">meander</span>, drifting from
        the story on the page to memories she hadn&apos;t visited in years.
      </p>

      <div className="btn-tactile w-full !py-2.5 !px-3 bg-brand text-xs shadow-tactile shadow-brand-shadow">
        <Eye size={13} /> Reveal
      </div>
    </div>
  );
}
