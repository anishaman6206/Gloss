import { prisma } from "@/lib/prisma";

const DAYS = 14;
const CHART_HEIGHT = 96;

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function computeStreak(counts: Map<string, number>): number {
  let streak = 0;
  const cursor = new Date();

  // If nothing's been reviewed yet today, the streak still counts through yesterday.
  if (!counts.get(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (counts.get(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default async function StatsPage() {
  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const logs = await prisma.reviewLog.findMany({
    where: { reviewedAt: { gte: since } },
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
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: counts.get(key) ?? 0,
    };
  });

  const streak = computeStreak(counts);
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
        <p className="text-sm text-ink/60">How steadily you&apos;ve been reviewing.</p>
      </div>

      <div className="flex items-baseline gap-2 rounded-2xl border border-ink/10 bg-white/60 p-6">
        <span className="text-4xl font-semibold">{streak}</span>
        <span className="text-sm text-ink/60">day{streak === 1 ? "" : "s"} in a row</span>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white/60 p-6">
        <p className="mb-4 text-sm font-medium text-ink/70">Reviews per day</p>
        <div className="flex items-end gap-2">
          {days.map((day) => {
            const barHeight =
              day.count > 0 ? Math.max(6, Math.round((day.count / maxCount) * CHART_HEIGHT)) : 2;
            return (
              <div
                key={day.key}
                className="flex flex-1 flex-col items-center justify-end gap-1"
                style={{ height: CHART_HEIGHT + 20 }}
              >
                <div className="w-full rounded-t bg-ink/70" style={{ height: barHeight }} />
                <span className="text-[10px] text-ink/40">{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
