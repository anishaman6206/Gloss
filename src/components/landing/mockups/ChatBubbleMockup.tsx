import { ImageIcon, Sparkles } from "lucide-react";

export function ChatBubbleMockup({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-3xl border-2 border-black/5 bg-white p-4 shadow-tactile shadow-black/10 ${className}`}
    >
      <div className="flex items-center gap-2 rounded-2xl bg-mango/[0.08] p-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mango/20 text-mango-shadow">
          <ImageIcon size={16} strokeWidth={2.4} />
        </span>
        <p className="text-[11px] text-ink-soft">
          A cliffside village at golden hour
        </p>
      </div>

      <div className="mt-3 space-y-2">
        <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-brand px-3 py-2 text-[11px] font-medium text-white">
          The houses is stacked on the hill.
        </div>
        <div className="mr-auto max-w-[85%] rounded-2xl rounded-tl-sm bg-black/[0.04] px-3 py-2 text-[11px] text-ink">
          <span className="mb-1 flex items-center gap-1 font-bold text-mango-shadow">
            <Sparkles size={10} /> Almost
          </span>
          Try: &ldquo;The houses <u>are</u> stacked on the hill.&rdquo;
        </div>
      </div>
    </div>
  );
}
