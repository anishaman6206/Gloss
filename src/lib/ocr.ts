import { createWorker } from "tesseract.js";
import type { OcrWord, Term } from "./types";

// Runs entirely in the browser. Returns word-level text + bounding boxes,
// grouped into lines, in reading order.
export async function recognizeWords(image: File | Blob | string): Promise<OcrWord[]> {
  const worker = await createWorker("eng");

  try {
    const { data } = await worker.recognize(image, {}, { blocks: true });
    const words: OcrWord[] = [];
    let lineIndex = 0;
    let wordCounter = 0;

    // Tesseract's typings lag its runtime output shape, so we read it loosely.
    const blocks = (data as unknown as { blocks?: TesseractBlock[] }).blocks ?? [];

    for (const block of blocks) {
      for (const paragraph of block.paragraphs ?? []) {
        for (const line of paragraph.lines ?? []) {
          for (const word of line.words ?? []) {
            const text = word.text?.trim();
            if (!text) continue;
            wordCounter += 1;
            words.push({
              id: `w${wordCounter}`,
              text,
              line: lineIndex,
              x0: word.bbox.x0,
              y0: word.bbox.y0,
              x1: word.bbox.x1,
              y1: word.bbox.y1,
            });
          }
          lineIndex += 1;
        }
      }
    }

    return words;
  } finally {
    await worker.terminate();
  }
}

type TesseractBbox = { x0: number; y0: number; x1: number; y1: number };
type TesseractWord = { text: string; bbox: TesseractBbox };
type TesseractLine = { words?: TesseractWord[] };
type TesseractParagraph = { lines?: TesseractLine[] };
type TesseractBlock = { paragraphs?: TesseractParagraph[] };

// Groups selected words into terms: consecutive selected words on the same
// OCR'd line (no unselected word between them) merge into one phrase.
// Anything else — a different line, or a gap on the same line — starts a
// new, independent term. This keeps a batch of unrelated tapped words from
// collapsing into one nonsense phrase.
export function clusterSelection(allWords: OcrWord[], selectedIds: Set<string>): Term[] {
  const byLine = new Map<number, OcrWord[]>();
  for (const word of allWords) {
    const arr = byLine.get(word.line) ?? [];
    arr.push(word);
    byLine.set(word.line, arr);
  }

  const terms: Term[] = [];
  let termCounter = 0;

  for (const words of byLine.values()) {
    const sorted = [...words].sort((a, b) => a.x0 - b.x0);
    const lineSentence = sorted.map((w) => w.text).join(" ");

    let current: OcrWord[] = [];
    const flush = () => {
      if (current.length === 0) return;
      termCounter += 1;
      terms.push({
        id: `term-${termCounter}`,
        phrase: current.map((w) => w.text).join(" "),
        sentence: lineSentence,
        words: current,
      });
      current = [];
    };

    for (const word of sorted) {
      if (selectedIds.has(word.id)) {
        current.push(word);
      } else {
        flush();
      }
    }
    flush();
  }

  terms.sort((a, b) => {
    const lineDiff = a.words[0].line - b.words[0].line;
    if (lineDiff !== 0) return lineDiff;
    return a.words[0].x0 - b.words[0].x0;
  });

  return terms;
}
