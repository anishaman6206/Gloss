"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";

export function ImageUploader({ onSelect }: { onSelect: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file && file.type.startsWith("image/")) onSelect(file);
    },
    [onSelect]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      data-testid="image-uploader"
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
        dragging
          ? "border-brand bg-brand/5 shadow-tactile shadow-brand-shadow"
          : "border-black/15 bg-white hover:border-brand/50 hover:bg-brand/[0.02]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        data-testid="image-uploader-input"
      />
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-white shadow-tactile shadow-brand-shadow animate-floaty">
        <Camera size={28} strokeWidth={2.5} />
      </span>
      <div>
        <p className="font-display text-2xl font-bold">Snap or drop a page</p>
        <p className="mt-1 text-ink-soft">
          Book, textbook, newspaper, anything with words.
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 text-xs font-bold text-ink-soft">
        <ImagePlus size={12} /> tap to choose · or drop here
      </span>
    </div>
  );
}
