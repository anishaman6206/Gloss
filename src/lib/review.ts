// Blanks the first occurrence of `phrase` inside `sentence`, tolerating
// simple suffix variation on each word (e.g. "get out" also matches "getting
// out" or "gets out") since generated examples don't always reuse the exact
// same inflection. Returns null if no such match exists at all.
export function blankPhrase(sentence: string, phrase: string): string | null {
  const words = phrase
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (words.length === 0) return null;

  const pattern = words.map((w) => `${w}\\w*`).join("\\s+");
  const match = sentence.match(new RegExp(`\\b${pattern}\\b`, "i"));
  if (!match || match.index === undefined) return null;

  return `${sentence.slice(0, match.index)}_____${sentence.slice(match.index + match[0].length)}`;
}

// First letter of each word, rest masked, e.g. "get out" -> "g__ o__".
export function buildHint(phrase: string): string {
  return phrase
    .trim()
    .split(/\s+/)
    .map((word) => word[0] + "_".repeat(Math.max(word.length - 1, 0)))
    .join(" ");
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
