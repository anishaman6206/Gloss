(() => {
  const MAX_PHRASE_LEN = 60;
  const SELECTION_DEBOUNCE_MS = 300;
  const GENERIC_LOOKUP_ERROR = "Couldn't get a definition — try again";
  const GENERIC_SAVE_ERROR = "Couldn't save that — try again";
  const LIBRARY_URL = "https://gloss-theta.vercel.app/library";
  const EXIT_ANIMATION_MS = 140;

  const SPEAKER_ICON = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 9 3 15 8 15 13 20 13 4 8 9 3 9"></polygon><path d="M16 8a5 5 0 0 1 0 8"></path></svg>`;
  const TRASH_ICON = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

  let popupEl = null;
  let debounceTimer = null;
  let settings = GLOSS_DEFAULT_SETTINGS;

  glossGetSettings().then((s) => {
    settings = s;
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.enabled) settings = { ...settings, enabled: changes.enabled.newValue };
    if (changes.theme) settings = { ...settings, theme: changes.theme.newValue };
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

    // Ignore selections made inside our own popup (e.g. copying the definition text).
    if (popupEl && popupEl.contains(range.commonAncestorContainer)) return null;

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
          actionsEl.innerHTML = "";
          statusEl.innerHTML =
            'Sign in to Gloss to save this — <a href="https://gloss-theta.vercel.app" target="_blank" rel="noopener noreferrer">open Gloss</a>';
          return;
        }
        if (res?.status === "subscription_required") {
          actionsEl.innerHTML = "";
          statusEl.innerHTML =
            'Your trial\'s ended — <a href="https://gloss-theta.vercel.app/subscribe" target="_blank" rel="noopener noreferrer">subscribe to keep saving words</a>';
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
      statusEl.textContent = res?.message || "Couldn't delete that — try again";
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
    if (e.key !== "Escape" || !popupEl) return;
    removePopup();
    // Otherwise the text stays visibly highlighted after the card it opened is gone.
    window.getSelection()?.removeAllRanges();
  });
})();
