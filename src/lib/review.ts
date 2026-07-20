// Builds a case-insensitive regex matching `phrase` inside a sentence,
// tolerating simple suffix variation on each word (e.g. "get out" also
// matches "getting out" or "gets out") since generated examples don't
// always reuse the exact same inflection. Returns null for an empty phrase.
function buildPhraseRegex(phrase: string): RegExp | null {
  const words = phrase
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (words.length === 0) return null;

  const pattern = words.map((w) => `${w}\\w*`).join("\\s+");
  return new RegExp(`\\b${pattern}\\b`, "i");
}

// Blanks the first occurrence of `phrase` inside `sentence`. Returns null if
// no such match exists at all.
export function blankPhrase(sentence: string, phrase: string): string | null {
  const regex = buildPhraseRegex(phrase);
  const match = regex ? sentence.match(regex) : null;
  if (!match || match.index === undefined) return null;

  return `${sentence.slice(0, match.index)}_____${sentence.slice(match.index + match[0].length)}`;
}

// Whether `phrase` (allowing the same suffix variation as blankPhrase)
// appears anywhere in `sentence`.
function containsPhrase(sentence: string, phrase: string): boolean {
  const regex = buildPhraseRegex(phrase);
  return regex ? regex.test(sentence) : false;
}

// First and last letter of each word, everything between masked, e.g.
// "toddling" -> "t______g", "get out" -> "get out" left as-is only when a
// word is 2 letters or shorter (nothing left to mask).
export function buildHint(phrase: string): string {
  return phrase
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 2) return word;
      return word[0] + "_".repeat(word.length - 2) + word[word.length - 1];
    })
    .join(" ");
}

// Chooses which sentence to show for recall-flip/produce-word review,
// preferring a stored (Groq-generated) example over the raw source
// sentence - the source sentence is whatever OCR captured at scan time and
// can be a mid-sentence fragment. Rotates randomly among the examples that
// actually contain the phrase, so a word isn't reviewed in the exact same
// context every time (contextual variability aids long-term retention).
export function pickReviewSentence(
  examples: string[],
  sourceSentence: string,
  phrase: string
): string {
  const validExamples = examples.filter((ex) => containsPhrase(ex, phrase));
  if (validExamples.length > 0) {
    return validExamples[Math.floor(Math.random() * validExamples.length)];
  }
  return sourceSentence;
}

// Prefers a stored example sentence for the fill-in-the-blank mode; falls
// back to the original source sentence if none of the examples work.
export function pickFillBlankSentence(
  examples: string[],
  sourceSentence: string,
  phrase: string
): string | null {
  for (const example of examples) {
    const blanked = blankPhrase(example, phrase);
    if (blanked) return blanked;
  }
  return blankPhrase(sourceSentence, phrase);
}
