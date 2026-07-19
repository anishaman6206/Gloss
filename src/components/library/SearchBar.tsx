"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";

const DEBOUNCE_MS = 300;

export function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialQuery);
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  function update(q: string) {
    setValue(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
      });
    }, DEBOUNCE_MS);
  }

  return (
    <div className="relative" data-testid="search-bar">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
        size={18}
      />
      <input
        value={value}
        onChange={(e) => update(e.target.value)}
        placeholder="Search your words…"
        data-testid="search-input"
        className="w-full rounded-2xl border-2 border-transparent bg-white pl-11 pr-4 py-3.5 text-base font-medium outline-none shadow-tactile shadow-black/5 focus:border-brand"
      />
    </div>
  );
}
