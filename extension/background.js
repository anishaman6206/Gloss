const API_BASE = "https://gloss-theta.vercel.app";
const MAX_RECENT = 20;
const GENERIC_LOOKUP_ERROR = "Couldn't get a definition — try again";
const OFFLINE_ERROR = "You're offline — try again once you're back online";

async function recordRecent(phrase, definition) {
  const { recentLookups = [] } = await chrome.storage.session.get("recentLookups");
  const updated = [{ phrase, definition, at: Date.now() }, ...recentLookups].slice(0, MAX_RECENT);
  await chrome.storage.session.set({ recentLookups: updated });
  // Persistent (unlike recentLookups) so the popup only shows the welcome
  // screen before a person's very first successful lookup, ever.
  await chrome.storage.local.set({ hasOnboarded: true });
}

async function defineLookup(payload) {
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
      return { status: "success", wordId: data.wordId };
    }
    return { status: "error" };
  } catch {
    return { status: "error", message: OFFLINE_ERROR };
  }
}

async function deleteWord(wordId) {
  if (!navigator.onLine) return { ok: false, message: OFFLINE_ERROR };
  try {
    const res = await fetch(`${API_BASE}/api/words/${encodeURIComponent(wordId)}`, {
      method: "DELETE",
      credentials: "include",
    });
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
    deleteWord(message.payload.wordId).then(sendResponse);
    return true;
  }
  if (message?.type === "stats") {
    getStatsSummary().then(sendResponse);
    return true;
  }
  return false;
});
