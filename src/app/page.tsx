"use client";

import Link from "next/link";
import {
  Camera,
  BookOpen,
  Repeat2,
  Sparkles,
  ArrowRight,
  Zap,
  Star,
  Crown,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PLANS } from "@/lib/planPricing";

export default function Landing() {
  const { user, login, loading } = useAuth();

  return (
    <div className="space-y-16" data-testid="landing-page">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2.5rem] border-2 border-black/5 bg-white p-8 shadow-tactile shadow-black/5 md:p-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-mango/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-brand/25 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-leaf-shadow">
            <Zap size={12} /> Scan free · save words
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Learn every word
            <br />
            <span className="text-brand">you actually read.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft md:text-xl">
            Snap a page. Tap a word. Get its meaning{" "}
            <em className="rounded bg-mango/25 px-1 not-italic">in context</em>, then keep
            it forever with spaced repetition.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/scan"
              data-testid="cta-scan-free"
              className="btn-tactile bg-brand text-lg shadow-tactile shadow-brand-shadow"
            >
              <Camera size={18} /> Scan a page · free
            </Link>
            {loading ? (
              <span
                aria-hidden="true"
                className="btn-tactile invisible border-2 border-black/10 shadow-tactile shadow-black/10"
              >
                <ArrowRight size={18} /> Sign in · save words
              </span>
            ) : user ? (
              <Link
                href="/library"
                data-testid="cta-open-library"
                className="btn-tactile !bg-white !text-ink border-2 border-black/10 shadow-tactile shadow-black/10 hover:bg-black/[0.02]"
              >
                Open my library
              </Link>
            ) : (
              <button
                onClick={login}
                data-testid="cta-start-trial"
                className="btn-tactile !bg-white !text-ink border-2 border-black/10 shadow-tactile shadow-black/10 hover:bg-black/[0.02]"
              >
                <ArrowRight size={18} /> Sign in · save words
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <Star size={14} className="fill-mango text-mango" /> Scan & lookup are always free
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star size={14} className="fill-mango text-mango" /> 7‑day trial for saving & reviews
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="space-y-6">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Three quick steps.</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Camera,
              tint: "bg-brand/15 text-brand-shadow",
              title: "Snap it",
              body: "Take a picture of the page you're reading. Text is OCR'd in your browser, nothing leaves your device.",
            },
            {
              icon: BookOpen,
              tint: "bg-mango/15 text-mango-shadow",
              title: "Tap the word",
              body: "Tap any word (or phrase) on the image. Get a definition based on the exact sentence, not a random one.",
            },
            {
              icon: Repeat2,
              tint: "bg-leaf/15 text-leaf-shadow",
              title: "Own it",
              body: "Saved words come back with SM‑2 spaced repetition. Recall, fill‑blank, produce‑word. Mixed, never boring.",
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="relative rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
                data-testid={`how-step-${i}`}
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${s.tint}`}
                >
                  <Icon size={22} strokeWidth={2.4} />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-1 text-ink-soft">{s.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two ways to practice */}
      <section className="space-y-6">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Two ways to practice.</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div
            className="relative rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
            data-testid="practice-path-scan"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/15 text-brand-shadow">
              <Camera size={22} strokeWidth={2.4} />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">Reading something?</h3>
            <p className="mt-1 text-ink-soft">
              Snap the page, tap the words you don&apos;t know, and save them for spaced‑repetition
              review.
            </p>
            <Link
              href="/scan"
              data-testid="practice-path-scan-cta"
              className="btn-tactile mt-5 bg-brand shadow-tactile shadow-brand-shadow"
            >
              Scan a page <ArrowRight size={16} />
            </Link>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl border-2 border-mango bg-white p-6 shadow-tactile shadow-mango-shadow"
            data-testid="practice-path-describe"
          >
            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-mango px-2.5 py-1 text-xs font-bold text-white">
              <Sparkles size={12} /> New
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mango/15 text-mango-shadow">
              <ImageIcon size={22} strokeWidth={2.4} />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">Want to practice speaking?</h3>
            <p className="mt-1 text-ink-soft">
              Listen to a picture described sentence by sentence, or write your own description and
              get AI feedback.
            </p>
            <Link
              href="/describe"
              data-testid="practice-path-describe-cta"
              className="btn-tactile mt-5 bg-mango shadow-tactile shadow-mango-shadow"
            >
              Try picture practice <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold md:text-4xl">One tiny price.</h2>
          <span className="rounded-full bg-leaf/15 px-3 py-1 text-xs font-bold text-leaf-shadow">
            First 7 days on us
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div
            className="relative rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
            data-testid="pricing-monthly"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-ink-faint">Monthly</p>
            <p className="mt-2 font-display text-5xl font-bold">
              {PLANS.monthly.price}{" "}
              <span className="text-lg font-medium text-ink-soft">{PLANS.monthly.suffix}</span>
            </p>
            <p className="mt-2 text-ink-soft">Save & review unlimited words.</p>
          </div>
          <div
            className="relative overflow-hidden rounded-3xl border-2 border-mango bg-white p-6 shadow-tactile shadow-mango-shadow"
            data-testid="pricing-yearly"
          >
            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-mango px-2.5 py-1 text-xs font-bold text-white">
              <Crown size={12} /> Best value
            </span>
            <p className="text-sm font-bold uppercase tracking-wider text-mango-shadow">Yearly</p>
            <p className="mt-2 font-display text-5xl font-bold">
              {PLANS.yearly.price}{" "}
              <span className="text-lg font-medium text-ink-soft">{PLANS.yearly.suffix}</span>
            </p>
            <p className="mt-2 text-ink-soft">
              Nearly 2 months free · works out to <b>₹33.3/mo</b>.
            </p>
          </div>
        </div>
        <div className="text-center">
          {loading ? (
            <span aria-hidden="true" className="btn-tactile invisible text-lg">
              Sign in · start your free trial <ArrowRight size={18} />
            </span>
          ) : user ? (
            <Link
              href="/library"
              className="btn-tactile bg-leaf text-lg shadow-tactile shadow-leaf-shadow"
              data-testid="cta-bottom-open"
            >
              Open my library <ArrowRight size={18} />
            </Link>
          ) : (
            <button
              onClick={login}
              className="btn-tactile bg-brand text-lg shadow-tactile shadow-brand-shadow"
              data-testid="cta-bottom-start"
            >
              Sign in · start your free trial <ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>

      {/* Footer strip */}
      <footer className="flex flex-col items-center gap-2 pb-6 text-sm text-ink-faint">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} /> Made for readers, not scrollers.
        </div>
        <div>© {new Date().getFullYear()} Gloss</div>
      </footer>
    </div>
  );
}
