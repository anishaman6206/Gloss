"use client";

// Small Web Speech API helper. Falls back silently if unsupported.

// Chrome only populates getVoices() after the async "voiceschanged" event
// fires (sometimes not until the first call), so we cache and keep the
// list fresh rather than reading it once.
let cachedVoices: SpeechSynthesisVoice[] = [];

function refreshVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  cachedVoices = window.speechSynthesis.getVoices();
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
}

// Common names system TTS engines use for their female English voices.
// No browser exposes real gender metadata, so this is a best-effort match
// that falls back to the first available voice for the language.
const FEMALE_VOICE_HINTS = [
  "female",
  "zira",
  "aria",
  "jenny",
  "samantha",
  "victoria",
  "susan",
  "karen",
  "moira",
  "tessa",
  "fiona",
  "google us english",
  "google uk english female",
];

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (cachedVoices.length === 0) refreshVoices();
  if (cachedVoices.length === 0) return null;

  const langPrefix = lang.slice(0, 2).toLowerCase();
  const langMatches = cachedVoices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  const pool = langMatches.length > 0 ? langMatches : cachedVoices;

  const female = pool.find((v) =>
    FEMALE_VOICE_HINTS.some((hint) => v.name.toLowerCase().includes(hint))
  );
  return female ?? pool[0] ?? null;
}

export function speak(text: string, lang = "en-US") {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.88;
  utter.pitch = 1;

  const voice = pickVoice(lang);
  if (voice) utter.voice = voice;

  synth.speak(utter);
}
