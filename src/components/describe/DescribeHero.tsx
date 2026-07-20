import Link from "next/link";
import { Play } from "lucide-react";
import type { DescribeImage } from "@/lib/types";

export function DescribeHero({ image }: { image: DescribeImage }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border-2 border-black/5 shadow-tactile shadow-black/10"
      data-testid="describe-hero"
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.imageUrl}
          alt={image.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/70 via-ink/5 to-transparent sm:block" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:max-w-lg sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          Featured scene
        </span>

        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          {image.title}
        </h2>

        <p className="mt-2 text-white/85 sm:text-lg">{image.sentences[0]}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={`/describe/${image.id}`}
            data-testid="describe-hero-cta"
            className="btn-tactile !bg-white !text-ink shadow-tactile shadow-black/20"
          >
            <Play size={18} fill="currentColor" /> Start describing
          </Link>
          <span className="inline-flex items-center rounded-2xl border-2 border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur">
            {image.vocab.length} words to learn
          </span>
        </div>
      </div>
    </div>
  );
}
