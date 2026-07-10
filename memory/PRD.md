# Gloss — Product Requirements Document

## Problem Statement (verbatim)
> I've attached my github url, you can read readme file and then codebase to get glimpse of the app, the app is working good in localhost but currently the UI/UX is very simple, i want to make it beautiful and dazzling like the modern english learning apps like RealLife app , also I want to make it production ready..want to deploy in vercel for now
>
> Follow-ups: vibrant/playful design, palette by agent, Emergent Google login, 7-day free trial gating **word saving + review only** (scan + definitions stay free), Razorpay for INR (₹79/mo, ₹599/yr).

## Vision
Gloss is a contextual-vocabulary app: snap a page, tap a word, get a meaning that fits the exact sentence, then own that word forever via spaced repetition. The redesign brings a vibrant, tactile, mobile-first personality — closer to RealLife/Duolingo than a generic dictionary tool.

## Personas
- **Ambitious reader** — reads books, wants to actually grow vocabulary, willing to pay for retention.
- **Language learner** — non-native English speaker studying literature/textbooks.
- **Casual power-user** — wants a beautiful daily habit + streaks.

## Core requirements
1. Scan a page → OCR client-side → tap words → contextual definitions.
2. Save words to a personal library.
3. Daily SM-2 spaced-repetition reviews across three mixed modes.
4. Streak & stats tracking.
5. Emergent Google auth, session cookie.
6. Razorpay subscription (7-day trial → ₹79/mo or ₹599/yr).
7. Only *save word* and *review grading* actions require an active trial or subscription.
8. Production-ready + Vercel-deployable.

## Implemented (Jul 10, 2026)
- **Complete UI redesign** in the "Vibrant Play" archetype: custom palette (ocean blue / mango / leaf / cherry), Fredoka + Nunito fonts, tactile 3D buttons (Y-translation on press), rounded-3xl cards, backdrop-blur navs, animated laser/floaty/wiggle effects, canvas-confetti on session summary, framer-motion page transitions.
- **New landing page** at `/` with hero, "Three quick steps", pricing preview and CTA — replacing the old `redirect to /scan`.
- **Redesigned Scan, Library, Review, Stats pages** — mobile-first, with data-testids on every interactive element.
- **Pronunciation** (Web Speech API) — tap the speaker on any word/definition card.
- **Streak milestones / achievements** on `/stats` (3-day fire, 1-week streak, 30-days strong).
- **Session summary confetti** + result breakdown (knew / hesitated / again).
- **Emergent Google Auth**: `/api/auth/session` (exchange), `/api/auth/me`, `/api/auth/logout`, sticky cookie, `AuthProvider`, `AuthCallbackHandler`, `AuthGate`.
- **Prisma schema** extended: `User`, `Session`, subscription fields; per-user `Word`, `Review`, `ReviewLog`.
- **Razorpay subscription** with `/api/subscribe` (creates a Razorpay **Order**) + `/api/subscribe/verify` (HMAC signature verification of the checkout success) + `/api/razorpay/webhook` (signature-verified `payment.captured` handler as a second-guarantee). Pricing page at `/subscribe`. Verified end-to-end with live test key `rzp_test_TBs4uRzcf1E8CI` — Razorpay Test Mode modal opens and orders are created (₹79 monthly / ₹599 yearly = 30/365 days added to `currentPeriodEnd`).
- **Server-side subscription gating** in `saveWord` and `gradeReview`.
- **SEO metadata**, `viewport` theme color, custom SVG favicon.
- **Vercel deployment prep**: `vercel.json` (`prisma migrate deploy && next build`), `next.config.mjs` cleanup, comprehensive `README.md` + `DEPLOY.md` with Neon Postgres step-by-step.
- **Rate limiting** on `/api/define` — 40 lookups/day per anon IP (persisted via new Prisma `DefineRateLimit` table with atomic upsert). Signed-in users bypass entirely. Response includes `x-ratelimit-limit` and `x-ratelimit-remaining` headers. When the cap trips, the UI renders a "Sign in for unlimited · 7 days free" CTA instead of the generic retry button.

## Backlog / Next
- **P1** — Swap to Razorpay **Subscriptions** API for true auto-renewal once the Razorpay account clears KYC review (currently using one-time Orders because the Subscriptions API is locked for accounts under review; period tracked in Prisma).
- **P1** — Add speech-recognition pronunciation *scoring* (Web Speech API `SpeechRecognition`) to the review flow.
- **P1** — Onboarding carousel for first-time users (3-4 steps).
- **P2** — Bottom-sheet modal for word detail on Library (currently inline expand).
- **P2** — Import Anki / CSV / Kindle "My Clippings" as word sources.
- **P2** — Public shareable "word cards" (unique URL per saved word) — great growth loop for a reader crowd.
- **P2** — PWA install prompt + offline library.
- **P3** — Test coverage (Playwright e2e).

## Deployment
- Provider: Vercel (Next.js native).
- DB: swap Prisma provider to `postgresql` and use Neon or Vercel Postgres in production. See `README.md` for the full guide.
