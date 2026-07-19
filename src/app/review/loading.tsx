export default function ReviewLoading() {
  return (
    <div className="space-y-6" data-testid="review-loading">
      <header className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <div className="h-5 w-20 animate-pulse rounded-full bg-black/5" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded-xl bg-black/5" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-lg bg-black/5" />
      </header>
      <div className="rounded-3xl border-2 border-black/5 bg-white p-8 shadow-tactile shadow-black/5">
        <div className="mx-auto h-4 w-40 animate-pulse rounded-lg bg-black/5" />
        <div className="mx-auto mt-6 h-32 w-full max-w-sm animate-pulse rounded-2xl bg-black/5" />
      </div>
    </div>
  );
}
