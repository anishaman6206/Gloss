"use client";

import { useState, useTransition, type ReactNode } from "react";

export function EmailPreferenceToggle({
  icon,
  title,
  description,
  initialEnabled,
  testId,
  onToggle,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  initialEnabled: boolean;
  testId: string;
  onToggle: (enabled: boolean) => Promise<unknown>;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(() => {
      onToggle(next);
    });
  }

  return (
    <div className="flex items-center justify-between rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand">
          {icon}
        </span>
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-sm text-ink-soft">{description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={isPending}
        onClick={toggle}
        data-testid={testId}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-brand" : "bg-black/10"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
