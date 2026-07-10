"use client";

import { useCallback, useMemo, useState } from "react";
import { Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { WordOverlay } from "./WordOverlay";
import { DefinitionCard, type LookupState } from "./DefinitionCard";
import { clusterSelection, recognizeWords } from "@/lib/ocr";
import type { OcrWord, Term } from "@/lib/types";

type Stage = "idle" | "reading" | "ready" | "empty";

function termKey(term: Term): string {
  return term.words.map((w) => w.id).join(",");
}

const COULD_NOT_REACH = "Couldn't reach the dictionary right now — try again in a moment.";

export function ScanWorkspace() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [words, setWords] = useState<OcrWord[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lookups, setLookups] = useState<Record<string, LookupState>>({});
  const [activeTerms, setActiveTerms] = useState<Term[]>([]);

  const currentTerms = useMemo(() => clusterSelection(words, selectedIds), [words, selectedIds]);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setWords([]);
    setSelectedIds(new Set());
    setLookups({});
    setActiveTerms([]);
    setStage("reading");

    const img = new Image();
    img.onload = async () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      try {
        const recognized = await recognizeWords(file);
        setWords(recognized);
        setStage(recognized.length > 0 ? "ready" : "empty");
      } catch {
        setStage("empty");
      }
    };
    img.src = url;
  }, []);

  const toggleWord = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const fetchDefinition = useCallback(async (term: Term) => {
    const key = termKey(term);
    setLookups((prev) => ({ ...prev, [key]: { status: "loading" } }));

    try {
      const res = await fetch("/api/define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase: term.phrase, sentence: term.sentence }),
      });
      const json = await res.json();
      if (json.ok) {
        setLookups((prev) => ({ ...prev, [key]: { status: "done", data: json.data } }));
      } else {
        setLookups((prev) => ({
          ...prev,
          [key]: { status: "error", message: json.error ?? COULD_NOT_REACH, code: json.code },
        }));
      }
    } catch {
      setLookups((prev) => ({ ...prev, [key]: { status: "error", message: COULD_NOT_REACH } }));
    }
  }, []);

  const handleLookup = useCallback(() => {
    const existingKeys = new Set(activeTerms.map(termKey));
    const toAdd: Term[] = [];
    for (const term of currentTerms) {
      if (!existingKeys.has(termKey(term))) toAdd.push(term);
    }
    if (toAdd.length === 0) return;
    setActiveTerms((prev) => [...prev, ...toAdd]);
    // Fire fetches AFTER state update, never inside the updater
    for (const term of toAdd) fetchDefinition(term);
    // reset selection so user can pick another word
    setSelectedIds(new Set());
  }, [activeTerms, currentTerms, fetchDefinition]);

  const reset = useCallback(() => {
    setImageUrl(null);
    setDimensions(null);
    setWords([]);
    setStage("idle");
    setSelectedIds(new Set());
    setLookups({});
    setActiveTerms([]);
  }, []);

  if (!imageUrl) {
    return <ImageUploader onSelect={handleFile} />;
  }

  return (
    <div className="space-y-5" data-testid="scan-workspace">
      <div className="relative overflow-hidden rounded-3xl border-2 border-black/10 bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Scanned page" className="block w-full select-none" />

        {stage === "ready" && dimensions && (
          <WordOverlay
            words={words}
            width={dimensions.width}
            height={dimensions.height}
            selectedIds={selectedIds}
            onToggle={toggleWord}
          />
        )}

        {stage === "reading" && (
          <div className="absolute inset-0 grid place-items-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/95 px-6 py-4 shadow-tactile shadow-black/20">
              <Loader2 className="animate-spin text-brand" size={22} />
              <p className="text-sm font-bold">Reading the page…</p>
            </div>
          </div>
        )}
      </div>

      {stage === "empty" && (
        <p className="rounded-2xl bg-cherry/10 p-4 text-sm text-cherry" data-testid="scan-empty">
          Couldn&apos;t find any text on that page — try a clearer or brighter photo.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={reset}
          data-testid="scan-reset"
          className="btn-tactile !bg-white !text-ink border-2 border-black/10 shadow-tactile shadow-black/10 !py-2"
        >
          <RotateCcw size={14} /> Scan another
        </button>
        {selectedIds.size > 0 && (
          <button
            onClick={handleLookup}
            data-testid="scan-lookup"
            className="btn-tactile bg-mango shadow-tactile shadow-mango-shadow"
          >
            <Sparkles size={16} />
            {currentTerms.length > 1 ? `Get ${currentTerms.length} meanings` : "Get the meaning"}
          </button>
        )}
      </div>

      {activeTerms.length > 0 && (
        <div className="space-y-3">
          {activeTerms.map((term) => (
            <DefinitionCard
              key={termKey(term)}
              term={term}
              lookup={lookups[termKey(term)] ?? { status: "loading" }}
              onRetry={() => fetchDefinition(term)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
