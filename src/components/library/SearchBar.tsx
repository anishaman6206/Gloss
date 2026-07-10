"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialQuery);
  const [, startTransition] = useTransition();

  function update(q: string) {
    setValue(q);
    startTransition(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <input
      value={value}
      onChange={(e) => update(e.target.value)}
      placeholder="Search your words…"
      className="w-full rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm outline-none focus:border-ink/40"
    />
  );
}
