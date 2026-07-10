import { ScanWorkspace } from "@/components/scan/ScanWorkspace";
import { Camera } from "lucide-react";

export const dynamic = "force-dynamic";

// Scanning and definition lookups are FREE — no login required.
// Auth + trial/subscription are only enforced when the user tries to save a word.
export default function ScanPage() {
  return (
    <div className="space-y-6" data-testid="scan-page">
      <header className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-shadow">
          <Camera size={12} /> Scan
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
          What are you reading today?
        </h1>
        <p className="mt-1 text-ink-soft">
          Snap a page. Tap what you don&apos;t know. Meanings arrive in context — free, no
          sign‑in needed.
        </p>
      </header>
      <ScanWorkspace />
    </div>
  );
}
