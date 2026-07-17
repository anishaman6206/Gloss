"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { setReminderPreference } from "@/lib/notifications";

export function ReminderToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(() => {
      setReminderPreference(next);
    });
  }

  return (
    <div className="flex items-center justify-between rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand">
          <Bell size={18} />
        </span>
        <div>
          <p className="font-bold">Due-review emails</p>
          <p className="text-sm text-ink-soft">
            A daily nudge when words are ready to review.
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={isPending}
        onClick={toggle}
        data-testid="reminder-toggle"
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
