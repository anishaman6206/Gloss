"use client";

import { BookOpen, LogIn } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function AuthGate() {
  const { login } = useAuth();
  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border-2 border-black/5 bg-white p-10 text-center shadow-tactile shadow-black/5"
      data-testid="auth-gate"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-mango/25 blur-3xl" />
      <div className="relative mx-auto max-w-md">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand text-white shadow-tactile shadow-brand-shadow">
          <BookOpen size={28} strokeWidth={2.5} />
        </span>
        <h2 className="mt-6 font-display text-3xl font-bold tracking-tight">Sign in to Gloss</h2>
        <p className="mt-2 text-ink-soft">
          Your library, streaks & reviews are tied to your account. It&apos;s a one‑tap
          Google sign‑in, no forms.
        </p>
        <button
          onClick={login}
          data-testid="auth-gate-login"
          className="btn-tactile mt-6 bg-brand text-lg shadow-tactile shadow-brand-shadow"
        >
          <LogIn size={18} /> Continue with Google
        </button>
        <p className="mt-4 text-xs text-ink-faint">
          By continuing you agree to our terms. 7‑day free trial starts on your first save.
        </p>
      </div>
    </div>
  );
}
