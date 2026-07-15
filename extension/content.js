(() => {
  const MAX_PHRASE_LEN = 60;
  const SELECTION_DEBOUNCE_MS = 300;
  const GENERIC_LOOKUP_ERROR = "Couldn't get a definition — try again";

  let popupEl = null;
  let debounceTimer = null;

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
    if (popupEl) {
      popupEl.remove();
      popupEl = null;
    }
  }

  function positionPopup(el, rect) {
    const margin = 8;
    const estWidth = 280;
    const estHeight = 160;

    const openAbove = rect.bottom + estHeight > window.innerHeight;
    const top = openAbove
      ? rect.top + window.scrollY - margin
      : rect.bottom + window.scrollY + margin;

    let left = rect.left + window.scrollX;
    const maxLeft = window.scrollX + window.innerWidth - estWidth - margin;
    if (left > maxLeft) left = Math.max(window.scrollX + margin, maxLeft);

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.transform = openAbove ? "translateY(-100%)" : "none";
  }

  function renderLoading(info) {
    removePopup();
    const el = document.createElement("div");
    el.className = "gloss-ext-popup";
    el.innerHTML = `<div class="gloss-ext-loading">Looking that up…</div>`;
    document.body.appendChild(el);
    positionPopup(el, info.rect);
    popupEl = el;
  }

  function renderError(message) {
    if (!popupEl) return;
    popupEl.innerHTML = `<div class="gloss-ext-error">${escapeHtml(message)}</div>`;
  }

  function renderResult(info, data) {
    if (!popupEl) return;

    const synonyms = (data.synonyms || []).slice(0, 3).join(", ");
    const example = (data.examples || [])[0];

    popupEl.innerHTML = `
      <div class="gloss-ext-header">
        <span class="gloss-ext-phrase">${escapeHtml(info.phrase)}</span>
        ${data.partOfSpeech ? `<span class="gloss-ext-pos">${escapeHtml(data.partOfSpeech)}</span>` : ""}
      </div>
      <div class="gloss-ext-def">${escapeHtml(data.definition)}</div>
      ${synonyms ? `<div class="gloss-ext-syn">${escapeHtml(synonyms)}</div>` : ""}
      ${example ? `<div class="gloss-ext-example">"${escapeHtml(example)}"</div>` : ""}
      <button class="gloss-ext-save-btn" type="button">Save to Gloss</button>
      <div class="gloss-ext-status"></div>
    `;

    const btn = popupEl.querySelector(".gloss-ext-save-btn");
    btn.addEventListener("click", () => handleSave(info, data, btn));
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
        const statusEl = popupEl.querySelector(".gloss-ext-status");
        if (!statusEl) return;

        if (res?.status === "success") {
          btn.textContent = "Saved ✓";
          return;
        }
        if (res?.status === "auth_required") {
          btn.style.display = "none";
          statusEl.innerHTML =
            'Sign in to Gloss to save this — <a href="https://gloss-theta.vercel.app" target="_blank" rel="noopener noreferrer">open Gloss</a>';
          return;
        }
        if (res?.status === "subscription_required") {
          btn.style.display = "none";
          statusEl.innerHTML =
            'Your trial\'s ended — <a href="https://gloss-theta.vercel.app/subscribe" target="_blank" rel="noopener noreferrer">subscribe to keep saving words</a>';
          return;
        }

        btn.disabled = false;
        btn.textContent = "Save to Gloss";
        statusEl.textContent = GENERIC_LOOKUP_ERROR;
      }
    );
  }

  function lookup(info) {
    renderLoading(info);
    chrome.runtime.sendMessage({ type: "define", payload: { phrase: info.phrase, sentence: info.sentence } }, (res) => {
      if (!popupEl) return; // dismissed while the request was in flight
      if (!res || !res.ok) {
        renderError(res?.error || GENERIC_LOOKUP_ERROR);
        return;
      }
      renderResult(info, res.data);
    });
  }

  document.addEventListener("selectionchange", () => {
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
    if (e.key === "Escape") removePopup();
  });
})();
