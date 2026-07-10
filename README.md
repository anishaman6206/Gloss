# Gloss

Gloss is a personal vocabulary app. Photograph a page from a book or textbook, tap the word or phrase you don't know directly on the image, and get a definition specific to how it's actually used in that sentence — not a generic dictionary entry. Saved words go into a personal word bank and come back for review on a spaced-repetition schedule.

There's no visible AI branding anywhere in the product. The intelligence is just how the app works.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite for local dev (swap `DATABASE_URL` to a Postgres connection string for production — the schema doesn't use any SQLite-only features)
- Tesseract.js for OCR, running entirely client-side — images never leave the browser
- Groq's chat completions API for definitions, called server-side only from `/api/define`

## Setup

```bash
npm install
```

Create `.env` (used by the Prisma CLI) with:

```
DATABASE_URL="file:./dev.db"
```

Create `.env.local` (used by the app at runtime, never committed) with:

```
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama-3.3-70b-versatile"   # optional, this is already the default
```

Then run the initial migration and start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

The app is available at `http://localhost:3000`.

## Pages

- `/scan` — photograph a page, tap words to select them, get contextual definitions, save the ones you want to keep
- `/library` — every saved word, searchable, with New / Learning / Learned status
- `/review` — a daily review session that mixes recall-flip, fill-in-the-blank, and produce-the-word modes, scheduled with the SM-2 algorithm
- `/stats` — reviews-per-day chart and current streak

## Project structure

```
prisma/schema.prisma       Word / Review / ReviewLog models
src/app/                   pages and the /api/define route
src/components/            scan, library, and review UI, grouped by feature
src/lib/                   prisma client, SM-2 scheduling, OCR + clustering,
                            Groq call, server actions, shared types
```

## Notes

- OCR and word selection are entirely client-side; only the definition-generation call goes to a server.
- The Groq API key and model are server-side configuration, not user-facing settings — there's no settings screen with a key or model picker.
- Speaking practice (pronunciation scoring via the Web Speech API) is a deliberate v2 feature. The review-mode type already has a slot reserved for it.
