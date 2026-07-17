import "server-only";
import commonWords from "@/data/common-words.json";

const COMMON_WORDS = new Set<string>(commonWords as string[]);

// `common-words.json` is a small, hand-compiled starter list of everyday
// English words, not a licensed frequency or CEFR corpus. A word's absence
// from it means "not in this list", not "rare" — don't read anything into
// the negative case. Swap in a properly sourced, redistributable dataset
// before treating this as real CEFR-style grading.
export function isCommonWord(phrase: string): boolean {
  const lemma = phrase.trim().toLowerCase();
  if (lemma.includes(" ")) return false;
  return COMMON_WORDS.has(lemma);
}
