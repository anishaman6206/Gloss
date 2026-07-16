const GLOSS_DEFAULT_SETTINGS = { theme: "auto", enabled: true };

function glossGetSettings() {
  return chrome.storage.local.get(GLOSS_DEFAULT_SETTINGS);
}

// Only called from contexts that have a `window` (content script, popup,
// options page) — never from the background service worker.
function glossResolveTheme(theme) {
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
