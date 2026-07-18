"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  displayStatus: "free" | "trialing" | "active" | "cancelling" | "expired";
  daysLeft: number;
  planId: string | null;
  wordCount: number;
  reviewCount: number;
};

const STATUS_STYLES: Record<AdminUserRow["displayStatus"], string> = {
  active: "bg-leaf/15 text-leaf-shadow",
  trialing: "bg-mango/15 text-mango-shadow",
  cancelling: "bg-mango/15 text-mango-shadow",
  expired: "bg-cherry/10 text-cherry",
  free: "bg-black/[0.04] text-ink-soft",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminUserTable({ users }: { users: AdminUserRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
    );
  }, [users, query]);

  return (
    <div className="space-y-3" data-testid="admin-user-table">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          data-testid="admin-search"
          className="w-full rounded-2xl border-2 border-transparent bg-black/[0.04] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand focus:bg-white"
        />
      </div>

      <div className="overflow-x-auto rounded-3xl border-2 border-black/5 bg-white shadow-tactile shadow-black/5">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b-2 border-black/5 text-left text-xs font-bold uppercase tracking-wider text-ink-faint">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Words</th>
              <th className="px-4 py-3 text-right">Reviews</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-b border-black/5 last:border-0"
                data-testid={`admin-row-${u.email}`}
              >
                <td className="px-4 py-3">
                  <p className="font-bold text-ink">{u.name}</p>
                  <p className="text-xs text-ink-faint">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                      STATUS_STYLES[u.displayStatus]
                    }`}
                  >
                    {u.displayStatus}
                  </span>
                  {(u.displayStatus === "trialing" || u.displayStatus === "cancelling") && (
                    <span className="ml-1.5 text-xs text-ink-faint">{u.daysLeft}d left</span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-soft">{u.planId ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-right font-bold">{u.wordCount}</td>
                <td className="px-4 py-3 text-right font-bold">{u.reviewCount}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-faint">
                  No users match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-faint">
        {filtered.length} of {users.length} users
      </p>
    </div>
  );
}
