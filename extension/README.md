# Gloss Chrome extension

Companion to the Gloss web app (`gloss-theta.vercel.app`). Select a word or phrase on any
regular web page, on a PDF rendered by an in-page viewer like PDF.js (e.g. arXiv's
"View PDF" reader), or on a directly-opened `.pdf` link (via the bundled Gloss PDF Reader —
see below), see its meaning in context, save it into the same library used by the web app.

## Load unpacked (dev)

1. `chrome://extensions` → enable Developer mode → "Load unpacked" → select this `extension/` folder.
2. You must already be signed into `https://gloss-theta.vercel.app` in the same Chrome
   profile for "Save to Gloss" to work — the extension reuses your existing session cookie,
   it does not have its own login flow.

## How it talks to the backend

- `POST /api/define` — anonymous, rate-limited definition lookup (same endpoint the web app uses).
- `POST /api/words` — signed-in word save. Thin wrapper around the `saveWord` server action
  used by `/scan`; returns 401 if not signed in, 402 if trial/subscription is inactive.

## Gloss PDF Reader

Chrome's built-in PDF viewer renders inside Chrome's own internal `chrome-extension://`
page, and Chrome does not allow a third-party extension's content script to run there —
`chrome-extension` isn't a valid scheme for `content_scripts.matches` at all (confirmed
against Chrome's manifest validator). There is no supported way for an extension to reach
that surface directly, so instead of trying to inject into it, the extension intercepts
the navigation *before* Chrome's viewer ever engages: a `declarativeNetRequest` rule
(registered dynamically from `background.js`, so it can reference the extension's own
runtime URL) redirects any top-level `.pdf` navigation to `viewer.html`, a small pdf.js-based
reader bundled under `vendor/pdfjs/`. `content.js` runs there unmodified — selecting text in
the rendered PDF opens the same lookup card as anywhere else.

The original PDF URL is carried in `viewer.html`'s URL *fragment* rather than a query
parameter, specifically so PDF links with their own signed/tokenized query strings
(`?token=...&expires=...`) survive the trip intact — a query param would have let the
original URL's own `&`/`=` characters collide with the outer one.

**Tradeoff worth knowing about:** making the automatic redirect work for PDFs hosted on
*any* domain (not just `gloss-theta.vercel.app`) requires `host_permissions` for all
`http(s)://` URLs, which is a materially broader permission grant than before (Chrome will
show a "Read and change all your data on all websites" warning on install/update). That's
the direct cost of the redirect being domain-agnostic rather than an allowlist.

## Other known limitations (not bugs, not fixing here)

- **Scanned/image-only PDFs**: no text layer, so nothing is selectable, regardless of viewer.
  This is a format limitation of the PDF itself, not something an extension can work around.
- **PDFs embedded via `<embed>`/`<object>`/`<iframe>`** on a page (as opposed to a direct
  top-level `.pdf` navigation) are not redirected to the Gloss reader yet — only `main_frame`
  navigations are. In-page PDF.js-style viewers (arXiv's abstract-page "View PDF," many
  journal sites) are unaffected by this since those already run as ordinary DOM content on
  an `http(s)://` page and content scripts reach them normally.
- **Firefox**: not targeted. Manifest V3 is Chrome-specific here, and Firefox ships its own
  built-in `pdf.js` with a different extension model — a Firefox port would need its own
  manifest and its own PDF-viewer strategy.
