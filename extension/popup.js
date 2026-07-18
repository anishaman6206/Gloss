const API_BASE = "https://usegloss.app";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

async function renderRecentList() {
  const listEl = document.getElementById("recent-list");
  const { recentLookups = [] } = await chrome.storage.session.get("recentLookups");

  if (!recentLookups.length) {
    listEl.innerHTML = `<li class="toolbar-empty">No lookups yet this session</li>`;
    return;
  }

  listEl.innerHTML = recentLookups
    .map(
      (item) =>
        `<li><span class="toolbar-phrase">${escapeHtml(item.phrase)}</span><span class="toolbar-def">${escapeHtml(item.definition)}</span></li>`
    )
    .join("");
}

function renderStats(res) {
  const statsRow = document.getElementById("stats-row");
  const signInPrompt = document.getElementById("stats-signin-prompt");

  if (res?.ok) {
    document.getElementById("stat-streak").textContent = res.streak;
    document.getElementById("stat-today").textContent = res.wordsToday;
    statsRow.classList.remove("hidden");
    signInPrompt.classList.add("hidden");
  } else {
    statsRow.classList.add("hidden");
    signInPrompt.classList.remove("hidden");
  }
}

async function applyTheme() {
  const { theme } = await glossGetSettings();
  document.documentElement.dataset.theme = glossResolveTheme(theme);
}

async function render() {
  await applyTheme();
  const { hasOnboarded } = await chrome.storage.local.get("hasOnboarded");
  const onboardingView = document.getElementById("onboarding-view");
  const recentView = document.getElementById("recent-view");
  const footerOnboarding = document.getElementById("footer-onboarding");
  const footerDashboard = document.getElementById("footer-dashboard");

  if (hasOnboarded) {
    onboardingView.classList.add("hidden");
    recentView.classList.remove("hidden");
    footerOnboarding.classList.add("hidden");
    footerDashboard.classList.remove("hidden");
    await renderRecentList();
    chrome.runtime.sendMessage({ type: "stats" }, renderStats);
  } else {
    onboardingView.classList.remove("hidden");
    recentView.classList.add("hidden");
    footerOnboarding.classList.remove("hidden");
    footerDashboard.classList.add("hidden");
  }
}

document.getElementById("open-library-onboarding").addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/library` });
});

document.getElementById("open-library").addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/library` });
});

document.getElementById("open-review").addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/review` });
});

document.getElementById("open-settings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

render();
