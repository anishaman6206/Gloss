export function SessionSummary({
  reviewed,
  knew,
  hesitated,
  again,
}: {
  reviewed: number;
  knew: number;
  hesitated: number;
  again: number;
}) {
  if (reviewed === 0) {
    return (
      <p className="pt-8 text-center text-sm text-ink/50">
        Nothing&apos;s due for review right now — check back later.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-6 text-center">
      <p className="text-2xl font-medium">Nice work.</p>
      <p className="text-sm text-ink/60">
        You reviewed {reviewed} {reviewed === 1 ? "word" : "words"}.
      </p>
      <div className="flex justify-center gap-6 text-sm text-ink/70">
        <span>{knew} knew it</span>
        <span>{hesitated} hesitated</span>
        <span>{again} to revisit</span>
      </div>
    </div>
  );
}
