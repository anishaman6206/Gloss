import { BookOpen, Download } from "lucide-react";

export function LibraryHeader({ canExport }: { canExport: boolean }) {
  return (
    <header
      className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-black/5 bg-white px-6 py-4 shadow-tactile shadow-black/5"
      data-testid="library-header"
    >
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mango/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-mango-shadow">
          <BookOpen size={12} /> Library
        </span>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight md:text-3xl">
          Your Vocabulary
        </h1>
        <p className="text-sm text-ink-soft">
          Manage, organize and review every word you&apos;ve learned.
        </p>
      </div>

      {canExport && (
        <a
          href="/api/export/anki"
          download
          data-testid="export-anki-link"
          className="flex shrink-0 items-center gap-1.5 rounded-2xl border-2 border-black/10 px-4 py-2.5 text-sm font-bold text-brand-shadow hover:bg-brand/5"
        >
          <Download size={14} /> Export to Anki
        </a>
      )}
    </header>
  );
}
