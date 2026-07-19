"use client";

import { RouteError } from "@/components/ui/RouteError";

export default function LibraryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} title="Couldn't load your library." />;
}
