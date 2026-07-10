import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AuthGate } from "@/components/auth/AuthGate";
import { Flame, BarChart3, Trophy, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

const DAYS = 14;
const CHART_HEIGHT = 120;

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function computeStreak(counts: Map<string, number>): number {
  let streak = 0;
  const cursor = new Date();
  if (!counts.get(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (counts.get(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const MILESTONES = [
  { count: 3, label: "3‑day fire", icon: Flame, tint: "mango" },
  { count: 7, label: "1 week streak", icon: Zap, tint: "brand" },
  { count: 30, label: "30 days strong", icon: Trophy, tint: "leaf" },
];

export default async function StatsPage() {
  const user = await getCurrentUser();
  if (!user) return <AuthGate />;

  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const logs = await prisma.reviewLog.findMany({
    where: { userId: user.id, reviewedAt: { gte: since } },
    select: { reviewedAt: true },
  });

  const counts = new Map<string, number>();
  for (const log of logs) {
    const key = dateKey(log.reviewedAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (DAYS - 1 - i));
    const key = dateKey(d);
    return {
      key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2),
      count: counts.get(key) ?? 0,
    };
  });

  const streak = computeStreak(counts);
  const totalReviews = logs.length;
  const totalWords = await prisma.word.count({ where: { userId: user.id } });
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="space-y-6" data-testid="stats-page">
      <header className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cherry/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cherry">
          <BarChart3 size={12} /> Stats
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Consistency is the flex.
        </h1>
      </header>

      {/* Streak + summary bento */}
      <div className="grid gap-4 md:grid-cols-3">
        <div
          className="relative overflow-hidden rounded-3xl border-2 border-mango bg-white p-6 shadow-tactile shadow-mango-shadow"
          data-testid="streak-card"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mango/20 blur-2xl" />
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-mango-shadow">
            <Flame size={16} className="animate-wiggle" /> Streak
          </div>
          <p className="mt-2 font-display text-6xl font-bold leading-none">{streak}</p>
          <p className="mt-1 text-sm text-ink-soft">
            day{streak === 1 ? "" : "s"} in a row
          </p>
        </div>
        <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
          <div className="text-sm font-bold uppercase tracking-wider text-brand-shadow">
            Total reviews (14d)
          </div>
          <p className="mt-2 font-display text-5xl font-bold">{totalReviews}</p>
        </div>
        <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
          <div className="text-sm font-bold uppercase tracking-wider text-leaf-shadow">
            Words saved
          </div>
          <p className="mt-2 font-display text-5xl font-bold">{totalWords}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <p className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-faint">
          Reviews per day
        </p>
        <div className="flex items-end gap-2" data-testid="reviews-chart">
          {days.map((day) => {
            const h =
              day.count > 0
                ? Math.max(8, Math.round((day.count / maxCount) * CHART_HEIGHT))
                : 3;
            return (
              <div
                key={day.key}
                className="flex flex-1 flex-col items-center justify-end gap-1.5"
                style={{ height: CHART_HEIGHT + 24 }}
              >
                <span className="text-[10px] font-bold text-ink-faint">
                  {day.count > 0 ? day.count : ""}
                </span>
                <div
                  className={`w-full rounded-xl ${
                    day.count > 0 ? "bg-gradient-to-t from-brand to-brand/60" : "bg-black/5"
                  }`}
                  style={{ height: h }}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <p className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-faint">
          Milestones
        </p>
        <div className="grid grid-cols-3 gap-3">
          {MILESTONES.map((m) => {
            const unlocked = streak >= m.count;
            const Icon = m.icon;
            const tintBg =
              m.tint === "mango" ? "bg-mango" : m.tint === "brand" ? "bg-brand" : "bg-leaf";
            const tintShadow =
              m.tint === "mango"
                ? "shadow-mango-shadow"
                : m.tint === "brand"
                ? "shadow-brand-shadow"
                : "shadow-leaf-shadow";
            return (
              <div
                key={m.count}
                data-testid={`milestone-${m.count}`}
                className={`rounded-2xl border-2 p-4 text-center transition-all ${
                  unlocked
                    ? `border-transparent ${tintBg} text-white shadow-tactile ${tintShadow}`
                    : "border-dashed border-black/10 bg-black/[0.02] text-ink-faint"
                }`}
              >
                <Icon size={24} className="mx-auto" strokeWidth={2.4} />
                <p className="mt-2 text-sm font-bold">{m.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
