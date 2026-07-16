const API_BASE = "https://gloss-theta.vercel.app";
const MAX_RECENT = 20;
const DEFINE_CACHE_LIMIT = 50;
const GENERIC_LOOKUP_ERROR = "Couldn't get a definition. Try again";
const OFFLINE_ERROR = "You're offline. Try again once you're back online";
const PDF_REDIRECT_RULE_ID = 1;

// Chrome's built-in PDF viewer is a separate, unreachable extension — this
// rule intercepts a direct PDF navigation before that viewer ever engages
// and sends it to our own viewer.html instead. The original URL rides in
// the URL *fragment* (after #), not a query param: fragments are opaque to
// URL parsing, so a PDF link whose own query string contains "&" or "="
// (signed/tokenized download links) survives intact. A query param would
// have silently corrupted those.
//
// Covers file:// as well as http(s)://, for locally-opened PDFs — this only
// takes effect once the user separately enables "Allow access to file URLs"
// for the extension in chrome://extensions, which Chrome requires per-user
// and can't be granted from the manifest alone.
//
// Registered as a *dynamic* rule (not a static rules.json) specifically so
// this can reference chrome.runtime.getURL(), which only resolves to the
// correct chrome-extension://<id>/ once the extension is actually running —
// a static rule file can't know its own id ahead of time.
async function registerPdfRedirectRule() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [PDF_REDIRECT_RULE_ID],
    addRules: [
      {
        id: PDF_REDIRECT_RULE_ID,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { regexSubstitution: `${chrome.runtime.getURL("viewer.html")}#\\0` },
        },
        condition: {
          regexFilter: "^(https?://|file:///).+\\.pdf(\\?[^#]*)?(#.*)?$",
          resourceTypes: ["main_frame"],
        },
      },
    ],
  });
}

chrome.runtime.onInstalled.addListener(() => {
  registerPdfRedirectRule();
});

// The rule above only catches URLs that literally end in ".pdf" — plenty of
// real PDFs don't (arXiv serves canonical links like
// https://arxiv.org/pdf/2301.12345, no extension at all, identified only by
// its response's Content-Type). A URL-pattern redirect can't see that; only
// the response headers can. This is the fallback for exactly that case: it
// reads the incoming Content-Type once headers arrive and hands the tab off
// to our viewer then. It's inherently a hair slower than the rule above
// (Chrome's own PDF viewer may already start engaging before this fires),
// so a brief flash of Chrome's viewer is possible here in a way it isn't for
// plain ".pdf" links — accepted tradeoff for covering extension-less PDFs at
// all, given Manifest V3 has no blocking pre-response redirect API left.
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.method !== "GET" || details.statusCode >= 400) return;
    const contentType = details.responseHeaders?.find((h) => h.name.toLowerCase() === "content-type")?.value || "";
    if (!contentType.toLowerCase().startsWith("application/pdf")) return;
    chrome.tabs.update(details.tabId, { url: `${chrome.runtime.getURL("viewer.html")}#${details.url}` });
  },
  { urls: ["http://*/*", "https://*/*"], types: ["main_frame"] },
  ["responseHeaders"]
);

function normalizePhrase(phrase) {
  return phrase.trim().toLowerCase();
}

async function recordRecent(phrase, definition) {
  const { recentLookups = [] } = await chrome.storage.session.get("recentLookups");
  const updated = [{ phrase, definition, at: Date.now() }, ...recentLookups].slice(0, MAX_RECENT);
  await chrome.storage.session.set({ recentLookups: updated });
  // Persistent (unlike recentLookups) so the popup only shows the welcome
  // screen before a person's very first successful lookup, ever.
  await chrome.storage.local.set({ hasOnboarded: true });
}

async function getCachedDefine(phrase) {
  const { defineCache = {} } = await chrome.storage.session.get("defineCache");
  return defineCache[normalizePhrase(phrase)] || null;
}

// Same-tab-session cache of successful /api/define responses, keyed by
// normalized phrase. Re-selecting a word you already looked up a minute ago
// shouldn't cost another network round trip (or, for unsaved words, another
// Groq call).
async function setCachedDefine(phrase, result) {
  const { defineCache = {} } = await chrome.storage.session.get("defineCache");
  const key = normalizePhrase(phrase);
  const keys = Object.keys(defineCache);
  if (keys.length >= DEFINE_CACHE_LIMIT && !(key in defineCache)) {
    delete defineCache[keys[0]]; // simple FIFO eviction
  }
  defineCache[key] = result;
  await chrome.storage.session.set({ defineCache });
}

// A cached response can carry a savedWordId — saving or deleting that exact
// word makes the cached entry wrong (it would claim the old saved state),
// so both mutations below drop the cache entry rather than let it go stale.
// This only catches saves/deletes made through the extension itself in this
// browser session — the website saving/deleting the same word in another
// tab won't invalidate an entry already cached here. Rare enough, and not
// worth a cross-surface sync mechanism to close.
async function invalidateCachedDefine(phrase) {
  const { defineCache = {} } = await chrome.storage.session.get("defineCache");
  delete defineCache[normalizePhrase(phrase)];
  await chrome.storage.session.set({ defineCache });
}

async function defineLookup(payload) {
  const cached = await getCachedDefine(payload.phrase);
  if (cached) return cached;

  if (!navigator.onLine) return { ok: false, error: OFFLINE_ERROR };
  try {
    const res = await fetch(`${API_BASE}/api/define`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) {
      await recordRecent(payload.phrase, data.data.definition);
      await setCachedDefine(payload.phrase, data);
    }
    return data;
  } catch {
    return { ok: false, error: OFFLINE_ERROR };
  }
}

async function saveWord(payload) {
  if (!navigator.onLine) return { status: "error", message: OFFLINE_ERROR };
  try {
    const res = await fetch(`${API_BASE}/api/words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (res.status === 401) return { status: "auth_required" };
    if (res.status === 402) return { status: "subscription_required" };
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      await invalidateCachedDefine(payload.phrase);
      return { status: "success", wordId: data.wordId };
    }
    return { status: "error" };
  } catch {
    return { status: "error", message: OFFLINE_ERROR };
  }
}

async function deleteWord(wordId, phrase) {
  if (!navigator.onLine) return { ok: false, message: OFFLINE_ERROR };
  try {
    const res = await fetch(`${API_BASE}/api/words/${encodeURIComponent(wordId)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok && phrase) await invalidateCachedDefine(phrase);
    return { ok: res.ok };
  } catch {
    return { ok: false, message: OFFLINE_ERROR };
  }
}

async function getStatsSummary() {
  try {
    const res = await fetch(`${API_BASE}/api/stats/summary`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "define") {
    defineLookup(message.payload).then(sendResponse);
    return true;
  }
  if (message?.type === "save") {
    saveWord(message.payload).then(sendResponse);
    return true;
  }
  if (message?.type === "delete") {
    deleteWord(message.payload.wordId, message.payload.phrase).then(sendResponse);
    return true;
  }
  if (message?.type === "stats") {
    getStatsSummary().then(sendResponse);
    return true;
  }
  if (message?.type === "open-options") {
    chrome.runtime.openOptionsPage();
    return false;
  }
  return false;
});

// With no default_popup, clicking the toolbar icon (or the _execute_action
// keyboard shortcut) fires this instead of opening a native dropdown. We
// hand off to the content script so it can render the panel floating in the
// page itself, like Grammarly/Apollo, rather than anchored outside it.
//
// The first sendMessage fails whenever there's no live content script to
// hear it — most commonly a tab that was already open before this extension
// was (re)loaded, since Chrome doesn't retroactively inject content scripts
// into existing tabs. Rather than treat that as "unsupported page" (which is
// what a full-tab popup.html fallback used to do — jarring, and it fired on
// every ordinary tab left open across a dev reload), force a fresh copy of
// the content script into that exact tab and retry.
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "toggle-panel" });
    return;
  } catch {
    // no live content script in this tab — fall through and (re)inject one
  }

  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["shared.js", "content.js"] });
  } catch {
    // Genuinely can't inject here — chrome://, the Web Store, etc. Only now
    // fall back to a full-tab view.
    chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    return;
  }

  // The injection above succeeded, so the panel toggle itself works from
  // here. A stale onMessage listener left behind by a prior reload of this
  // extension can still make Chrome report the reply port closing early —
  // that's not a real failure, so it isn't sent to the popup.html fallback.
  chrome.tabs.sendMessage(tab.id, { type: "toggle-panel" }).catch(() => {});
});
