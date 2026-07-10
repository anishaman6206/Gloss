# Gloss

Gloss is a personal vocabulary app. Photograph a page from a book or textbook, tap the word or phrase you don't know directly on the image, and get a definition specific to how it's actually used in that sentence — not a generic dictionary entry. Saved words go into a personal word bank and come back for review on a spaced-repetition schedule.

## Features

- **Scan and tap** — photograph any page, tap one or more words directly on the image, and get a definition based on the exact sentence they appear in
- **Personal word bank** — every saved word is searchable, with its definition, part of speech, synonyms, example sentences, and the original sentence it came from
- **Spaced repetition** — a daily review session schedules words using the SM-2 algorithm, so words you know well come back less often and words you struggle with come back sooner
- **Mixed review modes** — each session mixes recall-flip, fill-in-the-blank, and produce-the-word exercises rather than drilling one format
- **Progress tracking** — a reviews-per-day chart and streak counter show how consistently you're reviewing

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

- OCR and word selection run entirely in the browser; only the definition-generation call goes to a server.
- Speaking practice (pronunciation scoring) is planned for a future version.
