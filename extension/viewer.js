import * as pdfjsLib from "./vendor/pdfjs/build/pdf.mjs";

const VENDOR_BASE = chrome.runtime.getURL("vendor/pdfjs/");
pdfjsLib.GlobalWorkerOptions.workerSrc = `${VENDOR_BASE}build/pdf.worker.mjs`;

const params = new URLSearchParams(location.search);
const fileUrl = params.get("file");

const statusEl = document.getElementById("status");
const viewerEl = document.getElementById("viewer");
const titleEl = document.getElementById("doc-title");
const openOriginalLink = document.getElementById("open-original");

glossGetSettings().then(({ theme }) => {
  document.documentElement.dataset.theme = glossResolveTheme(theme);
});

function showLoading() {
  statusEl.hidden = false;
  viewerEl.hidden = true;
  statusEl.innerHTML = `
    <div class="pdf-spinner" aria-hidden="true"></div>
    <p>Loading PDF…</p>
  `;
}

function showError(message) {
  statusEl.hidden = false;
  viewerEl.hidden = true;
  statusEl.innerHTML = `<p class="pdf-error">${message}</p>`;
}

const CSS_SCALE = 1.5; // fixed for now; becomes the user-adjustable zoom level in the next commit

// Renders every page up front. Fine for typical papers/articles; a large
// scanned book would be worth switching to lazy, viewport-driven rendering —
// revisit if that turns out to matter in practice.
async function renderPage(pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber);
  const pixelRatio = window.devicePixelRatio || 1;
  const cssViewport = page.getViewport({ scale: CSS_SCALE });
  const canvasViewport = page.getViewport({ scale: CSS_SCALE * pixelRatio });

  const pageWrap = document.createElement("div");
  pageWrap.className = "pdf-page";
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
  pageWrap.style.setProperty("--total-scale-factor", String(CSS_SCALE));
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
}

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
    showError("No PDF was specified — open a PDF link with Gloss to view it here.");
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
    });

    const pdf = await loadingTask.promise;

    viewerEl.innerHTML = "";
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      await renderPage(pdf, pageNumber);
    }

    statusEl.hidden = true;
    viewerEl.hidden = false;
  } catch (err) {
    console.error("[Gloss PDF Reader] failed to load PDF", err);
    showError("Couldn't load this PDF — it may be protected, corrupted, or blocked by the site it's hosted on.");
  }
}

loadAndRender();
