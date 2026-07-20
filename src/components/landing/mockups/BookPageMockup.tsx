import { BookOpen, Newspaper, FileText } from "lucide-react";

export function BookPageMockup({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden rounded-3xl border-2 border-black/5 bg-white shadow-tactile shadow-black/10 ${className}`}
    >
      <div className="flex items-center justify-center gap-3 border-b-2 border-black/5 bg-black/[0.02] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-faint">
        <span className="inline-flex items-center gap-1">
          <BookOpen size={12} /> Book
        </span>
        <span className="inline-flex items-center gap-1">
          <Newspaper size={12} /> Article
        </span>
        <span className="inline-flex items-center gap-1">
          <FileText size={12} /> PDF
        </span>
      </div>

      <div className="relative flex gap-px bg-black/5 p-4">
        <div className="relative flex-1 space-y-2 rounded-l-lg bg-white p-3">
          <div className="h-2 w-[85%] rounded-full bg-black/10" />
          <div className="h-2 w-[70%] rounded-full bg-black/10" />
          <div className="h-2 w-[90%] rounded-full bg-black/10" />
          <div className="h-2 w-[60%] rounded-full bg-black/10" />
          <div className="h-2 w-[75%] rounded-full bg-black/10" />
        </div>

        <div className="relative flex-1 space-y-2 rounded-r-lg bg-white p-3">
          <div className="h-2 w-[80%] rounded-full bg-black/10" />
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-[35%] rounded-full bg-black/10" />
            <div className="relative h-2 w-[30%] rounded-full bg-brand/60 ring-2 ring-brand/30">
              <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
              </span>
            </div>
          </div>
          <div className="h-2 w-[65%] rounded-full bg-black/10" />
          <div className="h-2 w-[85%] rounded-full bg-black/10" />
          <div className="h-2 w-[50%] rounded-full bg-black/10" />
        </div>

        <div className="pointer-events-none absolute inset-y-4 left-1/2 w-4 -translate-x-1/2 bg-gradient-to-r from-black/10 via-black/5 to-black/10 blur-sm" />
      </div>
    </div>
  );
}
