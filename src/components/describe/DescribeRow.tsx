"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DescribeImage } from "@/lib/types";

export function DescribeRow({ title, images }: { title: string; images: DescribeImage[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div data-testid="describe-row">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold">{title}</h3>

        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="grid h-8 w-8 place-items-center rounded-full border-2 border-black/10 bg-white text-ink-soft hover:bg-black/[0.03]"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="grid h-8 w-8 place-items-center rounded-full border-2 border-black/10 bg-white text-ink-soft hover:bg-black/[0.03]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image) => (
          <Link
            key={image.id}
            href={`/describe/${image.id}`}
            data-testid={`describe-card-${image.id}`}
            className="group w-56 shrink-0 snap-start overflow-hidden rounded-2xl border-2 border-black/5 bg-white shadow-tactile shadow-black/5 transition-all duration-200 hover:-translate-y-1 sm:w-64"
          >
            <div className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.imageUrl}
                alt={image.title}
                className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <p className="truncate font-display text-sm font-bold">{image.title}</p>
              <p className="text-xs text-ink-faint">{image.vocab.length} words to learn</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
