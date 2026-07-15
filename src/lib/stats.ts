import "server-only";

export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function computeStreak(counts: Map<string, number>): number {
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
