"use client";

// Small Web Speech API helper. Falls back silently if unsupported.
export function speak(text: string, lang = "en-US") {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.95;
  utter.pitch = 1;
  synth.speak(utter);
}
