// A single OCR'd word with its bounding box, in image pixel coordinates.
export type OcrWord = {
  id: string;
  text: string;
  line: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

// A cluster of adjacent selected words on the same line — one lookup unit.
export type Term = {
  id: string;
  phrase: string;
  sentence: string;
  words: OcrWord[];
};

export type Definition = {
  definition: string;
  partOfSpeech: string;
  synonyms: string[];
  examples: string[];
};

export type DefineRequest = {
  phrase: string;
  sentence: string;
};

export type DefineResult =
  | { ok: true; data: Definition }
  | { ok: false; error: string; code?: string };

export type WordStatus = "new" | "learning" | "learned";

// Review quality mapped from UI interactions onto the SM-2 0-5 scale.
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

// v2 will add "speak" here (Web Speech API pronunciation scoring).
export type ReviewMode = "recall-flip" | "fill-blank" | "produce-word";

export type WordWithReview = {
  id: string;
  phrase: string;
  sentence: string;
  definition: string;
  partOfSpeech: string;
  synonyms: string[];
  examples: string[];
  createdAt: Date;
  review: {
    id: string;
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    nextReviewAt: Date;
    lastReviewedAt: Date | null;
    lapses: number;
  } | null;
};
