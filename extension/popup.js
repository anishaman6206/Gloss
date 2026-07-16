const rootEl = document.querySelector(".popup-root");

document.getElementById("open-library-onboarding").addEventListener("click", () => {
  chrome.tabs.create({ url: `${GLOSS_API_BASE}/library` });
});

document.getElementById("open-library").addEventListener("click", () => {
  chrome.tabs.create({ url: `${GLOSS_API_BASE}/library` });
});

document.getElementById("open-review").addEventListener("click", () => {
  chrome.tabs.create({ url: `${GLOSS_API_BASE}/review` });
});

document.getElementById("open-settings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

glossRenderPanelBody(rootEl);
