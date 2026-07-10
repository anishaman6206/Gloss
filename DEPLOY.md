# Neon Postgres + Vercel — Step-by-Step

Follow this in one sitting. ~15 minutes total.

---

## 1. Create the Neon project

1. Go to <https://console.neon.tech> and sign up (Google/GitHub login is instant, free tier is more than enough for launch).
2. Click **New Project**.
3. Fill in:
   - **Project name**: `gloss`
   - **Postgres version**: 16 (default)
   - **Region**: **AWS ap-south-1 (Mumbai)** — closest to your Indian users.
4. Click **Create Project**.

Neon will drop you on a page with a **Connection string** box. It looks like:

```
postgresql://user:password@ep-xxxxx-pooler.ap-south-1.aws.neon.tech/gloss?sslmode=require
```

There are two variants in the dropdown:
- **Pooled connection** (endpoint ends with `-pooler`) — **use this for `DATABASE_URL`**.
- **Direct connection** (no `-pooler`) — **use this for `DIRECT_URL`** (Prisma migrations need a direct connection because pooled connections don't support prepared statements needed by migrate).

**Copy both.** Keep this tab open.

---

## 2. Update the Prisma schema in your repo

Open `prisma/schema.prisma` and replace the `datasource db` block with:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Then regenerate migrations for Postgres:

```bash
# Point Prisma at Neon temporarily so it can generate the migration
export DATABASE_URL="<paste your pooled URL>"
export DIRECT_URL="<paste your direct URL>"

rm -rf prisma/migrations prisma/dev.db
npx prisma migrate dev --name init
```

Prisma will connect to Neon, create every table, and write a fresh migration under `prisma/migrations/`. Commit those files.

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "postgres: neon migration"
git push
```

---

## 3. Import the repo into Vercel

1. Go to <https://vercel.com/new> and pick your GitHub repo.
2. Framework preset should auto-detect as **Next.js**.
3. **Root directory**: leave as `./`.
4. **Build & Output**: leave defaults — `vercel.json` overrides them with `prisma generate && prisma migrate deploy && next build`.
5. Expand **Environment Variables** and add these (paste from your `.env.local`):

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** URL (with `-pooler`) |
| `DIRECT_URL` | Neon **direct** URL (no pooler) |
| `GROQ_API_KEY` | `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` |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `RAZORPAY_KEY_ID` | `rzp_test_TBs4uRzcf1E8CI` |
| `RAZORPAY_KEY_SECRET` | `D1giX1gd6tHQDG3j1wLbA6lx` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_TBs4uRzcf1E8CI` |
| `RAZORPAY_WEBHOOK_SECRET` | *(pick any strong string, e.g. `whsec_gloss_2026_secure_x9k2m`)* |
| `APP_URL` | leave empty; set it after the first deploy to your Vercel URL |

6. Click **Deploy**. First build takes ~2 minutes.

When the build succeeds, Vercel gives you a `https://gloss-<hash>.vercel.app` URL. Open it — the app should load with the Groq API working.

---

## 4. Point Razorpay webhook at your Vercel URL

1. Copy your Vercel URL (e.g., `https://gloss-anish.vercel.app`).
2. In Vercel → Project → **Settings → Environment Variables**, update `APP_URL` = your Vercel URL. Redeploy.
3. Go to <https://dashboard.razorpay.com> → **Settings → Webhooks → Add New**.
   - **URL**: `https://<your-vercel-url>/api/razorpay/webhook`
   - **Active events**: check `payment.captured` only.
   - **Secret**: paste the same value you put in `RAZORPAY_WEBHOOK_SECRET` (`whsec_gloss_2026_secure_x9k2m` in the example above).
4. Save.

---

## 5. Verify

Open your Vercel URL and:

1. Scan a page (or upload any book photo) → tap a word → confirm the definition arrives.
2. Click **Sign in · save words** → sign in with Google → you should return to the app with the trial badge showing "**Trial · 7d left**".
3. Click **Save to my library** → confirm the word appears in **Library**.
4. Go to **Subscribe** → click a plan → the Razorpay Test-mode checkout should open. Use test card `4111 1111 1111 1111`, any future date, any CVV. On success, you'll be redirected back and the top-right badge changes to **Pro**.

Done. Ship it.

---

## Custom domain (optional)

- Vercel → Project → **Settings → Domains → Add** — point your DNS `CNAME` at the provided target. Vercel handles HTTPS automatically.
- Update `APP_URL` env var and the Razorpay webhook URL to the custom domain.

---

## Common gotchas

- **`prisma migrate deploy` fails with "prepared statement already exists"** — you're using the pooled URL for migrations. Use `DIRECT_URL` (the non-pooler one). The `directUrl` field in `schema.prisma` handles this if configured correctly.
- **Session cookie not sticking after login** — happens if `APP_URL` isn't set to your production URL. Emergent Auth needs a full HTTPS redirect URL that matches the deployed origin.
- **Definitions timing out on Vercel** — Vercel free plan has a 10s function timeout. Groq usually responds in ~1–2s so you're fine, but if you see timeouts upgrade to Pro (60s).
