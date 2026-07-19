export default function LibraryLoading() {
  return (
    <div className="space-y-4" data-testid="library-loading">
      <div className="h-8 w-40 animate-pulse rounded-xl bg-black/5" />
      <div className="h-12 w-full animate-pulse rounded-2xl bg-black/5" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded-3xl border-2 border-black/5 bg-white shadow-tactile shadow-black/5"
          />
        ))}
      </div>
    </div>
  );
}
