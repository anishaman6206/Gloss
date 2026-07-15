const API_BASE = "https://gloss-theta.vercel.app";
const MAX_RECENT = 20;
const GENERIC_LOOKUP_ERROR = "Couldn't get a definition — try again";

async function recordRecent(phrase, definition) {
  const { recentLookups = [] } = await chrome.storage.session.get("recentLookups");
  const updated = [{ phrase, definition, at: Date.now() }, ...recentLookups].slice(0, MAX_RECENT);
  await chrome.storage.session.set({ recentLookups: updated });
}

async function defineLookup(payload) {
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
    return { ok: false, error: GENERIC_LOOKUP_ERROR };
  }
}

async function saveWord(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (res.status === 401) return { status: "auth_required" };
    if (res.status === 402) return { status: "subscription_required" };
    if (res.ok) return { status: "success" };
    return { status: "error" };
  } catch {
    return { status: "error" };
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
  return false;
});
