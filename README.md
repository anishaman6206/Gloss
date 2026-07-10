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
- **Subscriptions** — 7-day free trial, then ₹79/mo or ₹599/yr via Razorpay.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma (SQLite locally, Postgres in production)
- Tesseract.js (client-side OCR)
- Groq chat completions (server-side only)
- Framer Motion, Lucide icons, canvas-confetti
- Emergent-managed Google Auth, Razorpay subscriptions

## Local development

```bash
npm install
cp .env.example .env.local  # then fill in GROQ_API_KEY and Razorpay keys
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
| `RAZORPAY_KEY_ID` | Razorpay dashboard → Keys. |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard → Keys. |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay dashboard → Webhooks. |
| `RAZORPAY_PLAN_MONTHLY_ID` | Plan created in Razorpay dashboard for ₹79/month. |
| `RAZORPAY_PLAN_YEARLY_ID` | Plan created in Razorpay dashboard for ₹599/year. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID`, exposed to the client for Razorpay Checkout. |
| `APP_URL` | Public base URL. |

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

### 4. Configure Razorpay

1. Log in to https://dashboard.razorpay.com.
2. Create two Subscription Plans:
   - Monthly: ₹79, period `monthly`, interval 1.
   - Yearly: ₹599, period `yearly`, interval 1.
3. Copy each plan ID to `RAZORPAY_PLAN_MONTHLY_ID` / `RAZORPAY_PLAN_YEARLY_ID`.
4. Webhooks → Add:
   - URL: `https://<your-vercel-domain>/api/razorpay/webhook`
   - Events: `subscription.activated`, `subscription.charged`, `subscription.halted`, `subscription.paused`, `subscription.cancelled`, `subscription.resumed`, `subscription.completed`.
   - Secret: put the same value in `RAZORPAY_WEBHOOK_SECRET`.

### 5. Redeploy

Vercel will auto-deploy on push. Every push runs `prisma migrate deploy` so schema changes are safe.

## Pages

- `/` — landing / pricing.
- `/scan` — take a photo, tap words, get meanings.
- `/library` — every saved word, searchable, with audio.
- `/review` — today's due words in mixed modes with SM-2 scheduling.
- `/stats` — streak, review chart, milestone badges.
- `/subscribe` — pricing + Razorpay checkout.

## Notes

- OCR is 100% client-side. Photos never leave the browser.
- All server actions require an authenticated session.
- Free tier gates: word-saving and reviews require an active trial or subscription. Scans and definition lookups remain free.
