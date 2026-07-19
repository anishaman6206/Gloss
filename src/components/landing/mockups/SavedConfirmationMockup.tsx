import { Check } from "lucide-react";

export function SavedConfirmationMockup({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center gap-2.5 rounded-2xl border-2 border-black/5 bg-white px-3.5 py-3 shadow-tactile shadow-leaf-shadow/40 ${className}`}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-leaf/15 text-leaf-shadow">
        <Check size={14} strokeWidth={3} />
      </span>
      <div>
        <p className="text-xs font-bold leading-tight">Saved to Library</p>
        <p className="text-[10px] leading-tight text-ink-soft">Added successfully</p>
      </div>
    </div>
  );
}
