# Gloss Chrome extension

Companion to the Gloss web app (`gloss-theta.vercel.app`). Select a word or phrase on any
regular web page, or on a PDF rendered by an in-page viewer like PDF.js (e.g. arXiv's
"View PDF" reader), see its meaning in context, save it into the same library used by
the web app.

## Load unpacked (dev)

1. `chrome://extensions` → enable Developer mode → "Load unpacked" → select this `extension/` folder.
2. You must already be signed into `https://gloss-theta.vercel.app` in the same Chrome
   profile for "Save to Gloss" to work — the extension reuses your existing session cookie,
   it does not have its own login flow.

## How it talks to the backend

- `POST /api/define` — anonymous, rate-limited definition lookup (same endpoint the web app uses).
- `POST /api/words` — signed-in word save. Thin wrapper around the `saveWord` server action
  used by `/scan`; returns 401 if not signed in, 402 if trial/subscription is inactive.

## Known limitations (not bugs, not fixing here)

- **PDFs opened directly in Chrome's built-in viewer** (a bare `.pdf` URL, no site chrome
  around it) are entirely out of reach. That viewer renders inside Chrome's own internal
  `chrome-extension://` page, and Chrome does not allow a third-party extension's content
  script to run there — `chrome-extension` isn't a valid scheme for `content_scripts.matches`
  at all (confirmed against Chrome's manifest validator; an earlier draft of this manifest
  tried it and Chrome rejected the whole extension at load time). There's no supported
  workaround for arbitrary extensions; only Chrome's own built-in code can reach that surface.
  If you need to look up words in a PDF, use the address bar to open it, or use a site whose
  own PDF viewer is a normal in-page one (see below).
- **In-page PDF.js-style viewers** (arXiv's abstract-page "View PDF," many journal sites) run
  as ordinary DOM content on an `http(s)://` page, so `<all_urls>` content scripts reach them
  normally — this is the supported PDF path.
- **Scanned/image-only PDFs**: no text layer, so nothing is selectable, regardless of viewer.
  This is a format limitation of the PDF itself, not something an extension can work around.
- **Firefox**: not targeted. Manifest V3 is Chrome-specific here, and Firefox ships its own
  built-in `pdf.js` with a different extension model — a Firefox port would need its own
  manifest and its own PDF-viewer strategy.
