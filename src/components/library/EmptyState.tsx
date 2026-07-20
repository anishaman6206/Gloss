import Link from "next/link";
import { Sparkles } from "lucide-react";

export function EmptyState({ variant }: { variant: "no-words" | "no-matches" }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border-2 border-dashed border-black/10 bg-white p-10 text-center"
      data-testid={`library-empty-${variant}`}
    >
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand animate-floaty">
        <Sparkles size={22} strokeWidth={2.5} />
      </span>

      {variant === "no-words" ? (
        <>
          <p className="mt-4 font-display text-xl font-bold">
            Your vocabulary journey starts here.
          </p>
          <p className="mt-1 text-ink-soft">Scan a page to save your first word.</p>
          <Link
            href="/scan"
            data-testid="library-cta-scan"
            className="btn-tactile mt-6 bg-brand shadow-tactile shadow-brand-shadow"
          >
            Save your first word
          </Link>
        </>
      ) : (
        <>
          <p className="mt-4 font-display text-xl font-bold">No words match.</p>
          <p className="mt-1 text-ink-soft">Try a different search or filter.</p>
          <Link
            href="/library"
            data-testid="library-clear-filters"
            className="btn-tactile mt-6 !bg-white !text-ink border-2 border-black/10 shadow-tactile shadow-black/10"
          >
            Clear filters
          </Link>
        </>
      )}
    </div>
  );
}
