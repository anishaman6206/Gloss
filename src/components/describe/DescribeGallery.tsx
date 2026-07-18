import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DescribeImage } from "@/lib/types";

export function DescribeGallery({ images }: { images: DescribeImage[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="describe-gallery">
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
  );
}
