"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import type { LibrarySortOption, LibraryStatusFilter } from "@/lib/types";

const DEBOUNCE_MS = 300;

type ToolbarState = {
  q: string;
  status: LibraryStatusFilter;
  tag: string;
  sort: LibrarySortOption;
  pageSize: number;
};

const SELECT_CLASS =
  "rounded-2xl border-2 border-transparent bg-black/[0.04] px-3.5 py-3 text-sm font-bold text-ink outline-none focus:border-brand focus:bg-white";

export function FilterToolbar({
  initial,
  distinctTags,
}: {
  initial: ToolbarState;
  distinctTags: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initial.q);
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  // Rebuilding the query string from scratch (rather than merging into the
  // existing one, like Pagination does) is what drops any `?page=` param on
  // every filter change - exactly the "reset to page 1" behavior we want.
  function pushParams(next: Partial<ToolbarState>) {
    const merged: ToolbarState = { ...initial, q, ...next };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.status !== "all") params.set("status", merged.status);
    if (merged.tag) params.set("tag", merged.tag);
    if (merged.sort !== "newest") params.set("sort", merged.sort);
    if (merged.pageSize !== 25) params.set("pageSize", String(merged.pageSize));
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  function updateQ(value: string) {
    setQ(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ q: value }), DEBOUNCE_MS);
  }

  const hasFilters = !!q || initial.status !== "all" || !!initial.tag;

  return (
    <div
      className="sticky top-16 z-30 flex flex-wrap items-center gap-2 rounded-3xl border-2 border-black/5 bg-white/90 p-3 shadow-tactile shadow-black/5 backdrop-blur-xl"
      data-testid="filter-toolbar"
    >
      <div className="relative min-w-[200px] flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
          size={16}
        />
        <input
          value={q}
          onChange={(e) => updateQ(e.target.value)}
          placeholder="Search words, meanings, examples, tags…"
          data-testid="search-input"
          className="w-full rounded-2xl border-2 border-transparent bg-black/[0.04] py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-brand focus:bg-white"
        />
      </div>

      <select
        value={initial.status}
        onChange={(e) => pushParams({ status: e.target.value as LibraryStatusFilter })}
        data-testid="status-filter"
        className={SELECT_CLASS}
      >
        <option value="all">All statuses</option>
        <option value="new">New</option>
        <option value="learning">Learning</option>
        <option value="learned">Learned</option>
      </select>

      <select
        value={initial.tag}
        onChange={(e) => pushParams({ tag: e.target.value })}
        data-testid="tag-filter"
        className={SELECT_CLASS}
      >
        <option value="">All tags</option>
        {distinctTags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      <select
        value={initial.sort}
        onChange={(e) => pushParams({ sort: e.target.value as LibrarySortOption })}
        data-testid="sort-select"
        className={SELECT_CLASS}
      >
        <option value="newest">Recently added</option>
        <option value="oldest">Oldest first</option>
        <option value="az">A → Z</option>
        <option value="za">Z → A</option>
      </select>

      <select
        value={initial.pageSize}
        onChange={(e) => pushParams({ pageSize: Number(e.target.value) })}
        data-testid="page-size-select"
        className={SELECT_CLASS}
      >
        {[10, 25, 50, 100].map((size) => (
          <option key={size} value={size}>
            {size} / page
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.replace(pathname);
          }}
          data-testid="clear-filters"
          className="inline-flex items-center gap-1 rounded-2xl px-3 py-3 text-sm font-bold text-ink-faint hover:text-cherry"
        >
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
}
