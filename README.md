# Gloss

Your personal vocabulary, built from what you actually read. Snap a page, tap
words on the image, and get context-aware meanings powered by Groq — then keep
them forever with spaced repetition.

## Features

- **Scan & tap** — client-side OCR (Tesseract.js). Pictures never leave your device.
- **Context-aware definitions** — Groq (`llama-3.3-70b-versatile`) explains the word as used in that exact sentence.
- **Personal library** — searchable word bank with status badges (New / Learning / Learned) and audio (Web Speech API).
- **Daily review** — SM-2 spaced repetition with three mixed modes (recall-flip, fill-in-the-blank, produce-the-word), progress bar, and confetti celebrations.
- **Stats & streaks** — 14-day chart, streak counter, milestone badges.
- **Emergent Google Auth** — one-tap sign-in.
- **Subscriptions** — 7-day free trial, then ₹79/mo or ₹599/yr via Cashfree.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma (SQLite locally, Postgres in production)
- Tesseract.js (client-side OCR)
- Groq chat completions (server-side only)
- Framer Motion, Lucide icons, canvas-confetti
- Emergent-managed Google Auth, Cashfree subscriptions

## Local development

```bash
npm install
cp .env.example .env.local  # then fill in GROQ_API_KEY and Cashfree keys
npx prisma migrate dev
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Prisma database URL. Locally: `file:./prisma/dev.db`. Production: Postgres connection string. |
| `GROQ_API_KEY` | Server-only. From https://console.groq.com/keys. |
| `GROQ_MODEL` | Optional. Defaults to `llama-3.3-70b-versatile`. |
| `CASHFREE_APP_ID` | Cashfree dashboard → Developers → API Keys. |
| `CASHFREE_SECRET_KEY` | Cashfree dashboard → Developers → API Keys (secret is shown once). |
| `CASHFREE_ENV` | `SANDBOX` or `PRODUCTION` — switches the API/webhook-signature environment automatically. |
| `APP_URL` | Public base URL (e.g., https://gloss.vercel.app). |

## Deploying to Vercel

### 1. Push to GitHub

Use the "Save to GitHub" button in the editor.

### 2. Provision a Postgres database

Pick one:

- **Neon** (recommended, free tier): create a project at https://neon.tech, copy the pooled `DATABASE_URL`.
- **Vercel Postgres**: from the Vercel dashboard → Storage → Create → Postgres.

Then switch the Prisma provider before deploying:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Regenerate the initial migration for Postgres:

```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init
git add prisma && git commit -m "postgres migration"
```

### 3. Import to Vercel

- New Project → import the GitHub repo.
- Framework preset: **Next.js**.
- Add all env variables from the table above.
- Build command is already in `vercel.json` (`prisma migrate deploy && next build`).

### 4. Configure Cashfree

1. Log in to https://merchant.cashfree.com (use the Sandbox toggle while testing).
2. Copy your **App ID** + **Secret Key** into env variables `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, and set `CASHFREE_ENV` to `SANDBOX` or `PRODUCTION`.
3. **Developers → Webhooks** → add an endpoint:
   - URL: `https://<your-vercel-domain>/api/cashfree/webhook`
   - Events: `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`, `REFUND_STATUS_WEBHOOK`
   - Cashfree signs webhooks with your **Secret Key** automatically — no separate webhook secret to configure.
4. No dashboard-side return URL config is needed — it's set per-order by the app (`/api/subscribe/return`).

> The app uses **one-time Cashfree Orders** for ₹79 (30 days) and ₹599 (365 days), mirroring the prior Razorpay Orders design rather than a recurring-billing product — the server tracks `currentPeriodEnd` per user in Prisma so the UX is identical, and "cancel" simply stops nudging renewal rather than calling a Cashfree cancel-subscription API.

### 5. Redeploy

Vercel will auto-deploy on push. Every push runs `prisma migrate deploy` so schema changes are safe.

## Pages

- `/` — landing / pricing.
- `/scan` — take a photo, tap words, get meanings.
- `/library` — every saved word, searchable, with audio.
- `/review` — today's due words in mixed modes with SM-2 scheduling.
- `/stats` — streak, review chart, milestone badges.
- `/subscribe` — pricing + Cashfree checkout.

## Notes

- OCR is 100% client-side. Photos never leave the browser.
- All server actions require an authenticated session.
- Free tier gates: word-saving and reviews require an active trial or subscription. Scans and definition lookups remain free.
