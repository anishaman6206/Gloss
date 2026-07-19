export default function ProfileLoading() {
  return (
    <div className="space-y-6" data-testid="profile-loading">
      <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5 md:p-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-2xl bg-black/5" />
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded-lg bg-black/5" />
            <div className="h-4 w-56 animate-pulse rounded-lg bg-black/5" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-28 animate-pulse rounded-3xl border-2 border-black/5 bg-white shadow-tactile shadow-black/5" />
        <div className="h-28 animate-pulse rounded-3xl border-2 border-black/5 bg-white shadow-tactile shadow-black/5" />
      </div>
      <div className="h-40 animate-pulse rounded-3xl border-2 border-black/5 bg-white shadow-tactile shadow-black/5" />
    </div>
  );
}
