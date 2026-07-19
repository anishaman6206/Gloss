"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export function RouteError({
  error,
  reset,
  title = "Something went wrong.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="mx-auto max-w-md rounded-3xl border-2 border-black/5 bg-white p-10 text-center shadow-tactile shadow-black/5"
      data-testid="route-error"
    >
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cherry/10 text-cherry">
        <AlertTriangle size={22} strokeWidth={2.5} />
      </span>
      <p className="mt-4 font-display text-xl font-bold">{title}</p>
      <p className="mt-1 text-ink-soft">
        Give it another try, if it keeps happening let us know.
      </p>
      <button
        onClick={reset}
        data-testid="route-error-retry"
        className="btn-tactile mt-6 bg-brand shadow-tactile shadow-brand-shadow"
      >
        <RotateCcw size={16} /> Try again
      </button>
    </div>
  );
}
