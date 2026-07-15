const API_BASE = "https://gloss-theta.vercel.app";

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

async function render() {
  const { hasOnboarded } = await chrome.storage.local.get("hasOnboarded");
  const onboardingView = document.getElementById("onboarding-view");
  const recentView = document.getElementById("recent-view");

  if (hasOnboarded) {
    onboardingView.classList.add("hidden");
    recentView.classList.remove("hidden");
    await renderRecentList();
  } else {
    onboardingView.classList.remove("hidden");
    recentView.classList.add("hidden");
  }
}

document.getElementById("open-library").addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/library` });
});

document.getElementById("open-settings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

render();
