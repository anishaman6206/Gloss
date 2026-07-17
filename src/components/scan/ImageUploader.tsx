"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";

export function ImageUploader({ onSelect }: { onSelect: (file: File) => void }) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
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
      data-testid="image-uploader"
      className={`relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
        dragging
          ? "border-brand bg-brand/5 shadow-tactile shadow-brand-shadow"
          : "border-black/15 bg-white"
      }`}
    >
      {/* Separate inputs: `capture` forces straight into the camera on
          mobile, while its absence is needed for the gallery/files picker.
          Mobile browsers won't reliably offer both from a single input, so
          two explicit buttons guarantee both choices everywhere. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        data-testid="image-uploader-camera-input"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        data-testid="image-uploader-gallery-input"
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

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          data-testid="image-uploader-camera-btn"
          className="btn-tactile !py-2 bg-brand shadow-tactile shadow-brand-shadow"
        >
          <Camera size={16} />
          Take a photo
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          data-testid="image-uploader-gallery-btn"
          className="btn-tactile !bg-white !py-2 !text-ink border-2 border-black/10 shadow-tactile shadow-black/10"
        >
          <ImagePlus size={16} />
          Choose from gallery
        </button>
      </div>

      <span className="text-xs text-ink-faint">or drop an image here</span>
    </div>
  );
}
