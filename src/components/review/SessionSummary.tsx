"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";

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
  useEffect(() => {
    if (reviewed > 0) {
      const end = Date.now() + 800;
      const colors = ["#1CB0F6", "#FF9600", "#58CC02", "#FF4B4B"];
      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [reviewed]);

  if (reviewed === 0) {
    return (
      <div
        className="relative overflow-hidden rounded-3xl border-2 border-dashed border-black/10 bg-white p-10 text-center"
        data-testid="session-empty"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-leaf/10 text-leaf animate-floaty">
          <Trophy size={22} strokeWidth={2.5} />
        </span>
        <p className="mt-4 font-display text-2xl font-bold">All caught up!</p>
        <p className="mt-1 text-ink-soft">
          Nothing&apos;s due right now, go read something and come back.
        </p>
        <Link
          href="/scan"
          data-testid="session-cta-scan"
          className="btn-tactile mt-6 bg-brand shadow-tactile shadow-brand-shadow"
        >
          Scan a page <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl border-2 border-black/5 bg-white p-8 text-center shadow-tactile shadow-black/5"
      data-testid="session-summary"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-mango/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-leaf/25 blur-3xl" />

      <div className="relative">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-mango text-white shadow-tactile shadow-mango-shadow animate-wiggle">
          <Trophy size={28} strokeWidth={2.5} />
        </span>
        <p className="mt-4 font-display text-3xl font-bold tracking-tight">Nice work.</p>
        <p className="mt-1 text-ink-soft">
          You reviewed <b>{reviewed}</b> {reviewed === 1 ? "word" : "words"}.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-leaf/10 p-3">
            <p className="font-display text-2xl font-bold text-leaf-shadow">{knew}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-leaf-shadow">Knew</p>
          </div>
          <div className="rounded-2xl bg-mango/10 p-3">
            <p className="font-display text-2xl font-bold text-mango-shadow">{hesitated}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-mango-shadow">
              Hesitated
            </p>
          </div>
          <div className="rounded-2xl bg-cherry/10 p-3">
            <p className="font-display text-2xl font-bold text-cherry">{again}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-cherry">Again</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/stats"
            data-testid="summary-cta-stats"
            className="btn-tactile bg-brand shadow-tactile shadow-brand-shadow"
          >
            See stats <ArrowRight size={16} />
          </Link>
          <Link
            href="/scan"
            data-testid="summary-cta-scan"
            className="btn-tactile !bg-white !text-ink border-2 border-black/10 shadow-tactile shadow-black/10"
          >
            Scan more words
          </Link>
        </div>
      </div>
    </div>
  );
}
