"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Collapses a long page run into ["1", "…", 4, 5, 6, "…", "20"]-style tokens,
// always keeping the first/last page and a small window around the current one.
function buildPageTokens(page: number, totalPages: number): (number | "…")[] {
  const tokens: (number | "…")[] = [];
  const window = 1;

  for (let p = 1; p <= totalPages; p++) {
    const isEdge = p === 1 || p === totalPages;
    const isNearCurrent = Math.abs(p - page) <= window;
    if (isEdge || isNearCurrent) {
      tokens.push(p);
    } else if (tokens[tokens.length - 1] !== "…") {
      tokens.push("…");
    }
  }
  return tokens;
}

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  const tokens = buildPageTokens(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5" data-testid="library-pagination">
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        data-testid="pagination-prev"
        className="inline-flex items-center gap-1 rounded-xl border-2 border-black/10 px-3 py-2 text-sm font-bold text-ink-soft hover:bg-black/[0.03] disabled:opacity-40"
      >
        <ChevronLeft size={14} /> Prev
      </button>

      {tokens.map((token, i) =>
        token === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-ink-faint">
            …
          </span>
        ) : (
          <button
            key={token}
            type="button"
            onClick={() => goTo(token)}
            data-testid={`pagination-page-${token}`}
            className={`h-9 w-9 rounded-xl text-sm font-bold transition-colors ${
              token === page
                ? "bg-brand text-white shadow-tactile shadow-brand-shadow"
                : "text-ink-soft hover:bg-black/[0.03]"
            }`}
          >
            {token}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        data-testid="pagination-next"
        className="inline-flex items-center gap-1 rounded-xl border-2 border-black/10 px-3 py-2 text-sm font-bold text-ink-soft hover:bg-black/[0.03] disabled:opacity-40"
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}
