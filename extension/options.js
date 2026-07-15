function setActiveThemeButton(theme) {
  document.querySelectorAll("#theme-switch button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeChoice === theme);
  });
}

async function init() {
  const settings = await glossGetSettings();

  document.getElementById("enabled-toggle").checked = settings.enabled;
  setActiveThemeButton(settings.theme);
  document.documentElement.dataset.theme = glossResolveTheme(settings.theme);

  document.getElementById("enabled-toggle").addEventListener("change", (e) => {
    chrome.storage.local.set({ enabled: e.target.checked });
  });

  document.getElementById("theme-switch").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-theme-choice]");
    if (!btn) return;
    const theme = btn.dataset.themeChoice;
    chrome.storage.local.set({ theme });
    setActiveThemeButton(theme);
    document.documentElement.dataset.theme = glossResolveTheme(theme);
  });
}

init();
