import { ShieldAlert, Users } from "lucide-react";
import { getCurrentUser, subscriptionStatus } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminUserTable, type AdminUserRow } from "@/components/admin/AdminUserTable";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
};

function SummaryCard({
  label,
  value,
  tint,
}: {
  label: string;
  value: number;
  tint?: "brand" | "mango" | "leaf" | "cherry";
}) {
  const tintClass =
    tint === "brand"
      ? "text-brand-shadow"
      : tint === "mango"
      ? "text-mango-shadow"
      : tint === "leaf"
      ? "text-leaf-shadow"
      : tint === "cherry"
      ? "text-cherry"
      : "text-ink";

  return (
    <div className="rounded-2xl border-2 border-black/5 bg-white p-4 shadow-tactile shadow-black/5">
      <p className={`font-display text-2xl font-bold ${tintClass}`}>{value}</p>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">{label}</p>
    </div>
  );
}

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || !isAdmin(user.email)) {
    return (
      <div
        className="mx-auto max-w-md rounded-3xl border-2 border-black/5 bg-white p-10 text-center shadow-tactile shadow-black/5"
        data-testid="admin-denied"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cherry/10 text-cherry">
          <ShieldAlert size={22} strokeWidth={2.5} />
        </span>
        <p className="mt-4 font-display text-xl font-bold">Not authorized</p>
        <p className="mt-1 text-ink-soft">This page is restricted.</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { words: true, logs: true } } },
  });

  const rows: AdminUserRow[] = users.map((u) => {
    const sub = subscriptionStatus(u);
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt.toISOString(),
      displayStatus: sub.displayStatus,
      daysLeft: sub.daysLeft,
      planId: u.planId,
      wordCount: u._count.words,
      reviewCount: u._count.logs,
    };
  });

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const summary = {
    total: rows.length,
    trialing: rows.filter((r) => r.displayStatus === "trialing").length,
    active: rows.filter((r) => r.displayStatus === "active").length,
    cancelling: rows.filter((r) => r.displayStatus === "cancelling").length,
    expired: rows.filter((r) => r.displayStatus === "expired").length,
    newLast7: rows.filter((r) => new Date(r.createdAt).getTime() >= sevenDaysAgo).length,
    totalWords: rows.reduce((sum, r) => sum + r.wordCount, 0),
    totalReviews: rows.reduce((sum, r) => sum + r.reviewCount, 0),
  };

  return (
    <div className="space-y-6" data-testid="admin-page">
      <header className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">
          <Users size={12} /> Admin
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Users &amp; usage.
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total users" value={summary.total} />
        <SummaryCard label="Trialing" value={summary.trialing} tint="mango" />
        <SummaryCard label="Paid" value={summary.active} tint="leaf" />
        <SummaryCard label="Cancelling" value={summary.cancelling} tint="mango" />
        <SummaryCard label="Expired" value={summary.expired} tint="cherry" />
        <SummaryCard label="New (7d)" value={summary.newLast7} tint="brand" />
        <SummaryCard label="Words saved" value={summary.totalWords} />
        <SummaryCard label="Reviews done" value={summary.totalReviews} />
      </div>

      <AnnouncementForm />

      <AdminUserTable users={rows} />
    </div>
  );
}
