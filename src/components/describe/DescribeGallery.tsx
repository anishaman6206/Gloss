"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { describeImages, DESCRIBE_CATEGORIES } from "@/data/describeImages";
import type { DescribeCategory } from "@/lib/types";

export function DescribeGallery() {
  const [category, setCategory] = useState<DescribeCategory>("general");

  const images = describeImages.filter((img) => img.category === category);
  const activeMeta = DESCRIBE_CATEGORIES.find((c) => c.id === category);

  return (
    <div className="space-y-5" data-testid="describe-gallery">
      <div className="flex flex-wrap gap-2" data-testid="describe-category-tabs">
        {DESCRIBE_CATEGORIES.map((c) => {
          const count = describeImages.filter((img) => img.category === c.id).length;
          const active = c.id === category;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              data-testid={`describe-category-${c.id}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                active
                  ? "bg-brand text-white shadow-tactile shadow-brand-shadow"
                  : "bg-black/[0.04] text-ink-soft hover:bg-black/[0.07]"
              }`}
            >
              {c.label}
              {count === 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    active ? "bg-white/25 text-white" : "bg-black/10 text-ink-faint"
                  }`}
                >
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {images.length === 0 ? (
        <div
          className="relative overflow-hidden rounded-3xl border-2 border-dashed border-black/10 bg-white p-10 text-center"
          data-testid="describe-category-empty"
        >
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mango/10 text-mango animate-floaty">
            <Sparkles size={22} strokeWidth={2.5} />
          </span>
          <p className="mt-4 font-display text-xl font-bold">
            {activeMeta?.label} pack coming soon
          </p>
          <p className="mx-auto mt-1 max-w-sm text-ink-soft">
            {activeMeta?.comingSoonNote ?? "New scenes for this category are on the way."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {images.map((image) => (
            <Link
              key={image.id}
              href={`/describe/${image.id}`}
              data-testid={`describe-card-${image.id}`}
              className="group overflow-hidden rounded-3xl border-2 border-black/5 bg-white shadow-tactile shadow-black/5 transition-transform hover:-translate-y-0.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.imageUrl}
                alt={image.title}
                className="aspect-[3/2] w-full object-cover"
                loading="lazy"
              />
              <div className="flex items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-display text-lg font-bold">{image.title}</p>
                  <p className="text-sm text-ink-faint">{image.vocab.length} words to learn</p>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-brand"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
