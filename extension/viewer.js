import * as pdfjsLib from "./vendor/pdfjs/build/pdf.mjs";

const VENDOR_BASE = chrome.runtime.getURL("vendor/pdfjs/");
pdfjsLib.GlobalWorkerOptions.workerSrc = `${VENDOR_BASE}build/pdf.worker.mjs`;

// The original PDF URL lives in the fragment (set that way by background.js's
// redirect rule) rather than a query param, so it survives untouched even
// when it has its own "&"/"="-laden query string. Falls back to ?file= for
// manual testing (e.g. opening viewer.html directly while developing).
const fileUrl = location.hash ? location.hash.slice(1) : new URLSearchParams(location.search).get("file");

const statusEl = document.getElementById("status");
const viewerEl = document.getElementById("viewer");
const titleEl = document.getElementById("doc-title");
const openOriginalLink = document.getElementById("open-original");
const pageControls = document.getElementById("page-controls");
const zoomControls = document.getElementById("zoom-controls");
const pageIndicator = document.getElementById("page-indicator");
const zoomIndicator = document.getElementById("zoom-indicator");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const zoomOutBtn = document.getElementById("zoom-out");
const zoomInBtn = document.getElementById("zoom-in");

const MIN_SCALE = 0.6;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.15;
const DEFAULT_SCALE = 1.5;

let pdfDoc = null;
let cssScale = DEFAULT_SCALE;
let pageEls = [];
let currentPage = 1;
let pageObserver = null;

glossGetSettings().then(({ theme }) => {
  document.documentElement.dataset.theme = glossResolveTheme(theme);
});

function showLoading() {
  statusEl.hidden = false;
  viewerEl.hidden = true;
  pageControls.hidden = true;
  zoomControls.hidden = true;
  statusEl.innerHTML = `
    <div class="pdf-spinner" aria-hidden="true"></div>
    <p>Loading PDF…</p>
  `;
}

function showError(message) {
  statusEl.hidden = false;
  viewerEl.hidden = true;
  pageControls.hidden = true;
  zoomControls.hidden = true;
  statusEl.innerHTML = `<p class="pdf-error">${message}</p>`;
}

function updatePageIndicator() {
  pageIndicator.textContent = `${currentPage} / ${pdfDoc.numPages}`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= pdfDoc.numPages;
}

function updateZoomIndicator() {
  zoomIndicator.textContent = `${Math.round((cssScale / DEFAULT_SCALE) * 100)}%`;
  zoomOutBtn.disabled = cssScale <= MIN_SCALE;
  zoomInBtn.disabled = cssScale >= MAX_SCALE;
}

async function renderPage(pageNumber) {
  const page = await pdfDoc.getPage(pageNumber);
  const pixelRatio = window.devicePixelRatio || 1;
  const cssViewport = page.getViewport({ scale: cssScale });
  const canvasViewport = page.getViewport({ scale: cssScale * pixelRatio });

  const pageWrap = document.createElement("div");
  pageWrap.className = "pdf-page";
  pageWrap.dataset.pageNumber = String(pageNumber);
  pageWrap.style.width = `${cssViewport.width}px`;
  pageWrap.style.height = `${cssViewport.height}px`;
  viewerEl.appendChild(pageWrap);

  const canvas = document.createElement("canvas");
  canvas.className = "pdf-page-canvas";
  canvas.width = canvasViewport.width;
  canvas.height = canvasViewport.height;
  canvas.style.width = `${cssViewport.width}px`;
  canvas.style.height = `${cssViewport.height}px`;
  pageWrap.appendChild(canvas);

  const context = canvas.getContext("2d");
  await page.render({ canvasContext: context, viewport: canvasViewport }).promise;

  // pdf.js's TextLayer sizes itself via CSS calc() against these two custom
  // properties (see setLayerDimensions in pdf.mjs) — without them its width/
  // height resolve to nothing and every span collapses to the page's origin.
  pageWrap.style.setProperty("--total-scale-factor", String(cssScale));
  pageWrap.style.setProperty("--scale-round-x", "1px");
  pageWrap.style.setProperty("--scale-round-y", "1px");

  const textLayerDiv = document.createElement("div");
  textLayerDiv.className = "textLayer";
  pageWrap.appendChild(textLayerDiv);

  const textLayer = new pdfjsLib.TextLayer({
    textContentSource: page.streamTextContent(),
    container: textLayerDiv,
    viewport: cssViewport,
  });
  await textLayer.render();

  return pageWrap;
}

// Renders every page up front. Fine for typical papers/articles; a large
// scanned book would be worth switching to lazy, viewport-driven rendering —
// revisit if that turns out to matter in practice.
//
// Reveals the viewer before the loop starts and appends pages as each one
// finishes, rather than waiting for the whole document — on anything past a
// couple of pages, staring at one spinner for the entire render is worse
// than watching pages arrive one at a time.
async function renderAllPages() {
  pageObserver?.disconnect();
  viewerEl.innerHTML = "";
  pageEls = [];
  statusEl.hidden = true;
  viewerEl.hidden = false;

  for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
    pageEls.push(await renderPage(pageNumber));
  }

  pageObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        currentPage = Number(visible.target.dataset.pageNumber);
        updatePageIndicator();
      }
    },
    { threshold: [0.5] }
  );
  pageEls.forEach((el) => pageObserver.observe(el));

  updatePageIndicator();
  updateZoomIndicator();
  pageControls.hidden = pdfDoc.numPages <= 1;
  zoomControls.hidden = false;
}

function goToPage(pageNumber) {
  const el = pageEls[pageNumber - 1];
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function setZoom(newScale) {
  cssScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
  await renderAllPages();
  goToPage(currentPage);
}

prevPageBtn.addEventListener("click", () => goToPage(currentPage - 1));
nextPageBtn.addEventListener("click", () => goToPage(currentPage + 1));
zoomOutBtn.addEventListener("click", () => setZoom(cssScale - ZOOM_STEP));
zoomInBtn.addEventListener("click", () => setZoom(cssScale + ZOOM_STEP));

// Matches the conventions people already bring from other PDF/image viewers.
// Left/Right skip a page; Ctrl/Cmd +/-/0 zoom, mirroring the browser's own
// page-zoom shortcut instead of introducing a new one.
document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey) {
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      setZoom(cssScale + ZOOM_STEP);
    } else if (e.key === "-") {
      e.preventDefault();
      setZoom(cssScale - ZOOM_STEP);
    } else if (e.key === "0") {
      e.preventDefault();
      setZoom(DEFAULT_SCALE);
    }
    return;
  }
  if (e.key === "ArrowRight" || e.key === "PageDown") goToPage(currentPage + 1);
  else if (e.key === "ArrowLeft" || e.key === "PageUp") goToPage(currentPage - 1);
});

function titleFromUrl(url) {
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    return path.split("/").pop() || "PDF";
  } catch {
    return "PDF";
  }
}

async function loadAndRender() {
  if (!fileUrl) {
    showError("No PDF was specified. Open a PDF link with Gloss to view it here.");
    return;
  }

  openOriginalLink.href = fileUrl;
  titleEl.textContent = titleFromUrl(fileUrl);
  showLoading();

  try {
    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      cMapUrl: `${VENDOR_BASE}cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${VENDOR_BASE}standard_fonts/`,
      wasmUrl: `${VENDOR_BASE}wasm/`,
      isEvalSupported: false, // MV3 extension pages forbid eval; pdf.js must not fall back to it
      withCredentials: true, // send the site's own cookies, so session-gated PDFs still load
    });

    pdfDoc = await loadingTask.promise;
    await renderAllPages();
  } catch (err) {
    console.error("[Gloss PDF Reader] failed to load PDF", err);
    showError("Couldn't load this PDF. It may be protected, corrupted, or blocked by the site it's hosted on.");
  }
}

loadAndRender();
