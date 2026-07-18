"use client";

import { useState } from "react";
import { Headphones, PenLine } from "lucide-react";
import { ListenLearnMode } from "./ListenLearnMode";
import { PracticeMode } from "./PracticeMode";
import type { DescribeImage } from "@/lib/types";

type Mode = "listen" | "practice";

export function DescribeWorkspace({ image }: { image: DescribeImage }) {
  const [mode, setMode] = useState<Mode>("listen");

  return (
    <div className="space-y-5" data-testid="describe-workspace">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.imageUrl}
        alt={image.title}
        className="aspect-[3/2] w-full rounded-3xl border-2 border-black/5 object-cover shadow-tactile shadow-black/5"
      />

      <div className="flex gap-2 rounded-2xl bg-black/[0.04] p-1.5">
        <button
          onClick={() => setMode("listen")}
          data-testid="describe-tab-listen"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-colors ${
            mode === "listen" ? "bg-white text-ink shadow-tactile shadow-black/5" : "text-ink-soft"
          }`}
        >
          <Headphones size={15} /> Listen &amp; Learn
        </button>
        <button
          onClick={() => setMode("practice")}
          data-testid="describe-tab-practice"
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-colors ${
            mode === "practice" ? "bg-white text-ink shadow-tactile shadow-black/5" : "text-ink-soft"
          }`}
        >
          <PenLine size={15} /> Practice
        </button>
      </div>

      {mode === "listen" ? (
        <ListenLearnMode key={image.id} image={image} />
      ) : (
        <PracticeMode key={image.id} imageId={image.id} />
      )}
    </div>
  );
}
