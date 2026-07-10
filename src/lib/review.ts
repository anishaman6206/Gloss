// Blanks the first case-insensitive occurrence of `phrase` inside `sentence`.
// Returns null if the phrase doesn't literally appear (e.g. the model
// conjugated it differently in a generated example).
export function blankPhrase(sentence: string, phrase: string): string | null {
  const idx = sentence.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx === -1) return null;
  return `${sentence.slice(0, idx)}_____${sentence.slice(idx + phrase.length)}`;
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
