(() => {
  const MAX_PHRASE_LEN = 60;
  const SELECTION_DEBOUNCE_MS = 300;
  const GENERIC_LOOKUP_ERROR = "Couldn't get a definition. Try again";
  const GENERIC_SAVE_ERROR = "Couldn't save that. Try again";
  const LIBRARY_URL = "https://gloss-theta.vercel.app/library";
  const EXIT_ANIMATION_MS = 140;

  const SPEAKER_ICON = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 9 3 15 8 15 13 20 13 4 8 9 3 9"></polygon><path d="M16 8a5 5 0 0 1 0 8"></path></svg>`;
  const TRASH_ICON = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

  const BOOK_ICON_WHITE = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
  const BOOK_ICON_OUTLINE = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
  const BOOK_ICON_ACCENT = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#1cb0f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
  const SETTINGS_ICON = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
  const CLOSE_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  const REVIEW_ICON = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`;

  let popupEl = null;
  let panelEl = null;
  let panelDragState = null;
  let debounceTimer = null;
  let settings = GLOSS_DEFAULT_SETTINGS;

  glossGetSettings().then((s) => {
    settings = s;
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
      if (changes.enabled) settings = { ...settings, enabled: changes.enabled.newValue };
      if (changes.theme) settings = { ...settings, theme: changes.theme.newValue };
    }

    if (!panelEl) return;
    const rootEl = panelEl.querySelector(".popup-root");
    if (area === "local" && (changes.theme || changes.hasOnboarded)) {
      glossRenderPanelBody(rootEl);
    } else if (area === "session" && changes.recentLookups) {
      glossRenderRecentList(rootEl);
    }
  });

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  // Approximate on purpose: PDFs lay text out in absolutely-positioned spans
  // rather than flowing paragraphs, so "the sentence" is a best effort, not a guarantee.
  function extractSentence(range, phrase) {
    let container = range.commonAncestorContainer;
    if (container.nodeType === Node.TEXT_NODE) container = container.parentElement;
    const text = (container && container.textContent) || phrase;
    const sentences = text.match(/[^.!?]*[.!?]+(\s+|$)|[^.!?]+$/g) || [text];
    const match = sentences.find((s) => s.includes(phrase));
    return (match ? match.trim() : phrase).slice(0, 500);
  }

  function getSelectionInfo() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;

    const range = sel.getRangeAt(0);

    // Ignore selections made inside our own popup or panel (e.g. copying the definition text).
    if (popupEl && popupEl.contains(range.commonAncestorContainer)) return null;
    if (panelEl && panelEl.contains(range.commonAncestorContainer)) return null;

    const phrase = sel.toString().trim();
    if (!phrase || phrase.length > MAX_PHRASE_LEN) return null;

    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return null;

    return { phrase, sentence: extractSentence(range, phrase), rect };
  }

  function removePopup() {
    if (!popupEl) return;
    const el = popupEl;
    popupEl = null;
    el.classList.add("gloss-ext-exit");
    setTimeout(() => el.remove(), EXIT_ANIMATION_MS);
  }

  // Measures the element's real rendered size (after it's in the DOM) rather
  // than guessing, and only ever sets top/left — transform is left free for
  // the entrance/exit animation.
  function positionPopup(el, rect) {
    const margin = 8;
    const elRect = el.getBoundingClientRect();

    const openAbove = rect.bottom + elRect.height + margin > window.innerHeight;
    const top = openAbove
      ? rect.top + window.scrollY - elRect.height - margin
      : rect.bottom + window.scrollY + margin;

    let left = rect.left + window.scrollX;
    const maxLeft = window.scrollX + window.innerWidth - elRect.width - margin;
    if (left > maxLeft) left = Math.max(window.scrollX + margin, maxLeft);

    el.style.left = `${left}px`;
    el.style.top = `${Math.max(window.scrollY + margin, top)}px`;
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  }

  function renderLoading(info) {
    removePopup();
    const el = document.createElement("div");
    el.className = "gloss-ext-popup";
    el.dataset.theme = glossResolveTheme(settings.theme);
    el.setAttribute("role", "region");
    el.setAttribute("aria-label", `Gloss definition for "${info.phrase}"`);
    el.setAttribute("aria-live", "polite");
    el.innerHTML = `
      <div class="gloss-ext-skeleton-line gloss-ext-skeleton-title"></div>
      <div class="gloss-ext-skeleton-line"></div>
      <div class="gloss-ext-skeleton-line gloss-ext-skeleton-short"></div>
    `;
    document.body.appendChild(el);
    positionPopup(el, info.rect);
    popupEl = el;
  }

  function renderError(message) {
    if (!popupEl) return;
    popupEl.innerHTML = `<div class="gloss-ext-error">${escapeHtml(message)}</div>`;
  }

  function savedActionsMarkup(wordId) {
    return `
      <span class="gloss-ext-saved-badge gloss-ext-badge-pop">Saved ✓</span>
      <a class="gloss-ext-open-link" href="${LIBRARY_URL}" target="_blank" rel="noopener noreferrer">Open full definition</a>
      <button class="gloss-ext-delete-btn" type="button" data-word-id="${escapeHtml(wordId ?? "")}" title="Delete from Library" aria-label="Delete from Library">${TRASH_ICON}</button>
    `;
  }

  function renderResult(info, data, savedWordId) {
    if (!popupEl) return;

    const synonyms = (data.synonyms || []).slice(0, 3).join(", ");
    const example = (data.examples || [])[0];

    popupEl.innerHTML = `
      <div class="gloss-ext-header">
        <span class="gloss-ext-phrase">${escapeHtml(info.phrase)}</span>
        <button class="gloss-ext-say-btn" type="button" title="Listen" aria-label="Pronounce ${escapeHtml(info.phrase)}">${SPEAKER_ICON}</button>
        ${data.partOfSpeech ? `<span class="gloss-ext-pos">${escapeHtml(data.partOfSpeech)}</span>` : ""}
      </div>
      <div class="gloss-ext-def">${escapeHtml(data.definition)}</div>
      ${synonyms ? `<div class="gloss-ext-syn">${escapeHtml(synonyms)}</div>` : ""}
      ${example ? `<div class="gloss-ext-example">"${escapeHtml(example)}"</div>` : ""}
      <div class="gloss-ext-actions">
        ${savedWordId ? savedActionsMarkup(savedWordId) : `<button class="gloss-ext-save-btn" type="button">Save to Gloss</button>`}
      </div>
      <div class="gloss-ext-status"></div>
    `;

    popupEl.querySelector(".gloss-ext-say-btn").addEventListener("click", () => speak(info.phrase));

    const saveBtn = popupEl.querySelector(".gloss-ext-save-btn");
    if (saveBtn) saveBtn.addEventListener("click", () => handleSave(info, data, saveBtn));

    const deleteBtn = popupEl.querySelector(".gloss-ext-delete-btn");
    if (deleteBtn) deleteBtn.addEventListener("click", () => handleDelete(info, data, deleteBtn));
  }

  function handleSave(info, data, btn) {
    btn.disabled = true;
    btn.textContent = "Saving…";

    chrome.runtime.sendMessage(
      {
        type: "save",
        payload: {
          phrase: info.phrase,
          sentence: info.sentence,
          definition: data.definition,
          partOfSpeech: data.partOfSpeech,
          synonyms: data.synonyms || [],
          examples: data.examples || [],
        },
      },
      (res) => {
        if (!popupEl) return;
        const actionsEl = popupEl.querySelector(".gloss-ext-actions");
        const statusEl = popupEl.querySelector(".gloss-ext-status");
        if (!actionsEl || !statusEl) return;

        if (res?.status === "success") {
          actionsEl.innerHTML = savedActionsMarkup(res.wordId);
          const deleteBtn = actionsEl.querySelector(".gloss-ext-delete-btn");
          if (deleteBtn) deleteBtn.addEventListener("click", () => handleDelete(info, data, deleteBtn));
          return;
        }
        if (res?.status === "auth_required") {
          actionsEl.innerHTML = `
            <a class="gloss-ext-open-link" href="https://gloss-theta.vercel.app" target="_blank" rel="noopener noreferrer">Sign in to Gloss</a>
            <button class="gloss-ext-retry-btn" type="button">Retry</button>
          `;
          statusEl.textContent = "Saving needs a free Gloss account.";
          const retryBtn = actionsEl.querySelector(".gloss-ext-retry-btn");
          retryBtn.addEventListener("click", () => handleSave(info, data, retryBtn));
          return;
        }
        if (res?.status === "subscription_required") {
          actionsEl.innerHTML =
            '<a class="gloss-ext-open-link" href="https://gloss-theta.vercel.app/subscribe" target="_blank" rel="noopener noreferrer">Subscribe to keep saving words</a>';
          statusEl.textContent = "Your trial's ended.";
          return;
        }

        btn.disabled = false;
        btn.textContent = "Save to Gloss";
        statusEl.textContent = res?.message || GENERIC_SAVE_ERROR;
      }
    );
  }

  function handleDelete(info, data, btn) {
    const wordId = btn.dataset.wordId;
    if (!wordId) return;
    btn.disabled = true;

    chrome.runtime.sendMessage({ type: "delete", payload: { wordId, phrase: info.phrase } }, (res) => {
      if (!popupEl) return;
      const actionsEl = popupEl.querySelector(".gloss-ext-actions");
      const statusEl = popupEl.querySelector(".gloss-ext-status");
      if (!actionsEl || !statusEl) return;

      if (res?.ok) {
        actionsEl.innerHTML = `<button class="gloss-ext-save-btn" type="button">Save to Gloss</button>`;
        actionsEl
          .querySelector(".gloss-ext-save-btn")
          .addEventListener("click", (e) => handleSave(info, data, e.currentTarget));
        statusEl.textContent = "Removed from library";
        return;
      }

      btn.disabled = false;
      statusEl.textContent = res?.message || "Couldn't delete that. Try again";
    });
  }

  function lookup(info) {
    renderLoading(info);
    chrome.runtime.sendMessage({ type: "define", payload: { phrase: info.phrase, sentence: info.sentence } }, (res) => {
      if (!popupEl) return; // dismissed while the request was in flight
      if (!res || !res.ok) {
        renderError(res?.error || GENERIC_LOOKUP_ERROR);
        return;
      }
      renderResult(info, res.data, res.savedWordId);
    });
  }

  // Floating toolbar panel — the same content as popup.html's toolbar
  // dropdown, but injected into the page itself (position: fixed) so it
  // stays put on scroll and doesn't get dismissed the instant the user
  // clicks the page, the way Grammarly/Apollo's panels behave. The toolbar
  // icon has no default_popup anymore; background.js messages this file to
  // toggle it.
  function panelMarkup() {
    return `
      <div class="popup-root">
        <div class="toolbar-title-row gloss-ext-panel-handle">
          <span class="toolbar-brand">
            <span class="toolbar-brand-mark" aria-hidden="true">${BOOK_ICON_WHITE}</span>
            <span class="toolbar-title">Gloss</span>
          </span>
          <span class="toolbar-actions">
            <button class="toolbar-icon-btn gloss-ext-panel-settings" type="button" title="Settings" aria-label="Settings">${SETTINGS_ICON}</button>
            <button class="toolbar-icon-btn gloss-ext-panel-close" type="button" title="Close" aria-label="Close Gloss panel">${CLOSE_ICON}</button>
          </span>
        </div>

        <section id="onboarding-view" class="onboarding hidden">
          <div class="onboarding-icon-wrap" aria-hidden="true">
            <span class="onboarding-blob onboarding-blob-a"></span>
            <span class="onboarding-blob onboarding-blob-b"></span>
            <div class="onboarding-icon">${BOOK_ICON_ACCENT}</div>
          </div>
          <h1 class="onboarding-title">Learn every word you actually read.</h1>
          <p class="onboarding-copy">Select any word on any page and Gloss shows you what it means, right there in context.</p>
          <p class="onboarding-note">Free to look up. Saving words needs a free Gloss account.</p>
          <div class="onboarding-hint">
            <span class="onboarding-hint-dot" aria-hidden="true"></span>
            Try it: highlight a word on this page
          </div>
        </section>

        <section id="recent-view" class="hidden">
          <div class="stats-row hidden" id="stats-row">
            <div class="stat-tile">
              <div class="stat-value" id="stat-streak">–</div>
              <div class="stat-label">🔥 Day streak</div>
            </div>
            <div class="stat-tile">
              <div class="stat-value" id="stat-today">–</div>
              <div class="stat-label">Saved today</div>
            </div>
          </div>
          <p class="stats-signin-prompt hidden" id="stats-signin-prompt">
            <a href="${GLOSS_API_BASE}" target="_blank" rel="noopener noreferrer">Sign in to Gloss</a>
            to see your streak
          </p>
          <p class="section-label">Recent lookups</p>
          <ul id="recent-list" class="toolbar-list"></ul>
        </section>

        <div class="toolbar-footer" id="footer-onboarding">
          <button class="toolbar-text-link gloss-ext-panel-library" type="button">Peek at your Gloss library</button>
        </div>

        <div class="toolbar-footer toolbar-btn-row hidden" id="footer-dashboard">
          <button class="toolbar-link-btn gloss-ext-panel-library" type="button">${BOOK_ICON_OUTLINE} Library</button>
          <button class="toolbar-ghost-btn gloss-ext-panel-review" type="button">${REVIEW_ICON} Review</button>
        </div>
      </div>
    `;
  }

  function openPanel() {
    const el = document.createElement("div");
    el.className = "gloss-ext-panel";
    el.innerHTML = panelMarkup();
    document.body.appendChild(el);
    panelEl = el;

    const rootEl = el.querySelector(".popup-root");
    glossRenderPanelBody(rootEl);

    el.querySelector(".gloss-ext-panel-settings").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "open-options" });
    });
    el.querySelector(".gloss-ext-panel-close").addEventListener("click", closePanel);
    el.querySelectorAll(".gloss-ext-panel-library").forEach((btn) =>
      btn.addEventListener("click", () => window.open(`${GLOSS_API_BASE}/library`, "_blank", "noopener,noreferrer"))
    );
    el.querySelector(".gloss-ext-panel-review").addEventListener("click", () =>
      window.open(`${GLOSS_API_BASE}/review`, "_blank", "noopener,noreferrer")
    );

    el.querySelector(".gloss-ext-panel-handle").addEventListener("mousedown", startPanelDrag);
  }

  function closePanel() {
    if (!panelEl) return;
    stopPanelDrag();
    panelEl.remove();
    panelEl = null;
  }

  function togglePanel() {
    if (panelEl) closePanel();
    else openPanel();
  }

  // Drag is tracked purely in viewport coordinates (unlike positionPopup's
  // scroll-aware math for the lookup card) since this panel is position:
  // fixed and never tracks a point in the document.
  function startPanelDrag(e) {
    if (!panelEl) return;
    e.preventDefault();
    const rect = panelEl.getBoundingClientRect();
    panelEl.style.left = `${rect.left}px`;
    panelEl.style.top = `${rect.top}px`;
    panelEl.style.right = "auto";
    panelDragState = { startX: e.clientX, startY: e.clientY, startLeft: rect.left, startTop: rect.top };
    document.addEventListener("mousemove", onPanelDrag);
    document.addEventListener("mouseup", stopPanelDrag);
  }

  function onPanelDrag(e) {
    if (!panelDragState || !panelEl) return;
    const margin = 8;
    const maxLeft = Math.max(margin, window.innerWidth - panelEl.offsetWidth - margin);
    const maxTop = Math.max(margin, window.innerHeight - panelEl.offsetHeight - margin);
    const left = Math.min(Math.max(margin, panelDragState.startLeft + (e.clientX - panelDragState.startX)), maxLeft);
    const top = Math.min(Math.max(margin, panelDragState.startTop + (e.clientY - panelDragState.startY)), maxTop);
    panelEl.style.left = `${left}px`;
    panelEl.style.top = `${top}px`;
  }

  function stopPanelDrag() {
    panelDragState = null;
    document.removeEventListener("mousemove", onPanelDrag);
    document.removeEventListener("mouseup", stopPanelDrag);
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "toggle-panel") togglePanel();
  });

  document.addEventListener("selectionchange", () => {
    if (!settings.enabled) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const info = getSelectionInfo();
      if (info) lookup(info);
    }, SELECTION_DEBOUNCE_MS);
  });

  document.addEventListener("mousedown", (e) => {
    if (popupEl && !popupEl.contains(e.target)) removePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (popupEl) {
      removePopup();
      // Otherwise the text stays visibly highlighted after the card it opened is gone.
      window.getSelection()?.removeAllRanges();
    } else if (panelEl) {
      closePanel();
    }
  });
})();
