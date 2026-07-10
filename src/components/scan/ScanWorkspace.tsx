"use client";

import { useCallback, useMemo, useState } from "react";
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
          [key]: { status: "error", message: json.error ?? COULD_NOT_REACH },
        }));
      }
    } catch {
      setLookups((prev) => ({ ...prev, [key]: { status: "error", message: COULD_NOT_REACH } }));
    }
  }, []);

  const handleLookup = useCallback(() => {
    setActiveTerms((prev) => {
      const existingKeys = new Set(prev.map(termKey));
      const merged = [...prev];
      for (const term of currentTerms) {
        if (!existingKeys.has(termKey(term))) {
          merged.push(term);
          fetchDefinition(term);
        }
      }
      return merged;
    });
  }, [currentTerms, fetchDefinition]);

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
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-black/5">
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
          <div className="absolute inset-0 flex items-center justify-center bg-paper/70">
            <p className="text-sm font-medium">Reading the page…</p>
          </div>
        )}
      </div>

      {stage === "empty" && (
        <p className="text-sm text-ink/60">
          Couldn&apos;t find any text on that page — try a clearer or brighter photo.
        </p>
      )}

      <div className="flex items-center justify-between">
        <button onClick={reset} className="text-sm text-ink/50 underline underline-offset-2">
          Scan another page
        </button>
        {selectedIds.size > 0 && (
          <button
            onClick={handleLookup}
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper"
          >
            {currentTerms.length > 1 ? "Get the meanings" : "Get the meaning"}
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
