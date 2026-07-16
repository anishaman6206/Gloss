const GLOSS_DEFAULT_SETTINGS = { theme: "auto", enabled: true };
const GLOSS_API_BASE = "https://gloss-theta.vercel.app";

function glossGetSettings() {
  return chrome.storage.local.get(GLOSS_DEFAULT_SETTINGS);
}

// Only called from contexts that have a `window` (content script, popup,
// options page) — never from the background service worker.
function glossResolveTheme(theme) {
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function glossEscapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// Shared between popup.js (rootEl = the .popup-root in popup.html) and
// content.js's floating panel (rootEl = the .popup-root injected into the
// host page). Everything below queries relative to rootEl rather than
// document.getElementById so the exact same code is safe to run inside an
// arbitrary host page without risking an ID collision with that page's own
// elements — the injected panel is the only caller where that risk exists,
// but keeping both callers on the same scoped lookups keeps them from
// drifting apart.
async function glossRenderRecentList(rootEl) {
  const listEl = rootEl.querySelector("#recent-list");
  if (!listEl) return;
  const { recentLookups = [] } = await chrome.storage.session.get("recentLookups");

  if (!recentLookups.length) {
    listEl.innerHTML = `<li class="toolbar-empty">No lookups yet this session</li>`;
    return;
  }

  listEl.innerHTML = recentLookups
    .map(
      (item) =>
        `<li><span class="toolbar-phrase">${glossEscapeHtml(item.phrase)}</span><span class="toolbar-def">${glossEscapeHtml(item.definition)}</span></li>`
    )
    .join("");
}

function glossRenderStats(rootEl, res) {
  const statsRow = rootEl.querySelector("#stats-row");
  const signInPrompt = rootEl.querySelector("#stats-signin-prompt");
  if (!statsRow || !signInPrompt) return;

  if (res?.ok) {
    rootEl.querySelector("#stat-streak").textContent = res.streak;
    rootEl.querySelector("#stat-today").textContent = res.wordsToday;
    statsRow.classList.remove("hidden");
    signInPrompt.classList.add("hidden");
  } else {
    statsRow.classList.add("hidden");
    signInPrompt.classList.remove("hidden");
  }
}

async function glossApplyTheme(rootEl) {
  const { theme } = await glossGetSettings();
  rootEl.dataset.theme = glossResolveTheme(theme);
}

// Renders the onboarding-vs-recent-lookups body shared by popup.html and
// the floating panel. rootEl must be the .popup-root element itself (not an
// ancestor) since the theme is applied via rootEl.dataset.theme, matching
// the .popup-root[data-theme="dark"] rule in popup.css.
async function glossRenderPanelBody(rootEl) {
  await glossApplyTheme(rootEl);

  const { hasOnboarded } = await chrome.storage.local.get("hasOnboarded");
  const onboardingView = rootEl.querySelector("#onboarding-view");
  const recentView = rootEl.querySelector("#recent-view");
  const footerOnboarding = rootEl.querySelector("#footer-onboarding");
  const footerDashboard = rootEl.querySelector("#footer-dashboard");
  if (!onboardingView || !recentView) return;

  if (hasOnboarded) {
    onboardingView.classList.add("hidden");
    recentView.classList.remove("hidden");
    footerOnboarding.classList.add("hidden");
    footerDashboard.classList.remove("hidden");
    await glossRenderRecentList(rootEl);
    chrome.runtime.sendMessage({ type: "stats" }, (res) => glossRenderStats(rootEl, res));
  } else {
    onboardingView.classList.remove("hidden");
    recentView.classList.add("hidden");
    footerOnboarding.classList.remove("hidden");
    footerDashboard.classList.add("hidden");
  }
}
