# Gloss Chrome extension

Companion to the Gloss web app (`gloss-theta.vercel.app`). Select a word or phrase on any
page or Chrome-viewed PDF, see its meaning in context, save it into the same library used
by the web app.

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

- **Scanned/image-only PDFs**: no text layer, so nothing is selectable. This is a format
  limitation of the PDF itself, not something an extension can work around.
- **Non-Chrome-viewer PDF embeds**: some journal sites use a custom in-page PDF viewer.
  Whether text selection works there depends entirely on that viewer's own implementation —
  this extension activates wherever the browser's normal selection API is exposed, and simply
  won't where it isn't.
- **Firefox**: not targeted. Manifest V3 and the Chrome-PDF-viewer-extension-ID technique used
  here (`chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/*`) are Chrome-specific. Firefox
  ships its own built-in `pdf.js` and a different extension model — a Firefox port would need
  its own manifest and its own PDF-viewer strategy.
