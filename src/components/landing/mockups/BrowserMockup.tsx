export function BrowserMockup({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden rounded-3xl border-2 border-black/5 bg-white shadow-tactile shadow-black/10 ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b-2 border-black/5 bg-black/[0.02] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-cherry/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-mango/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-leaf/40" />
      </div>

      <div className="space-y-3 p-5">
        <div className="h-3 w-[92%] rounded-full bg-black/10" />
        <div className="h-3 w-[85%] rounded-full bg-black/10" />

        <div className="flex flex-wrap gap-1.5">
          <div className="h-3 w-[28%] rounded-full bg-black/10" />
          <div className="relative h-3 w-[20%] rounded-full bg-brand/60 ring-2 ring-brand/30">
            <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
            </span>
          </div>
          <div className="h-3 w-[24%] rounded-full bg-black/10" />
        </div>

        <div className="h-3 w-[70%] rounded-full bg-black/10" />
        <div className="h-3 w-[80%] rounded-full bg-black/10" />
      </div>
    </div>
  );
}
