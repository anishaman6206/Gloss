const API_BASE = "https://gloss-theta.vercel.app";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

async function renderRecent() {
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

document.getElementById("open-library").addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/library` });
});

renderRecent();
