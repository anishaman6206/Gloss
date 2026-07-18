import { Image as ImageIcon } from "lucide-react";
import { DescribeGallery } from "@/components/describe/DescribeGallery";

export const dynamic = "force-static";

export default function DescribePage() {
  return (
    <div className="space-y-6" data-testid="describe-page">
      <header className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-shadow">
          <ImageIcon size={12} /> Describe
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Practice by describing a picture.
        </h1>
        <p className="mt-1 text-ink-soft">
          Listen to a scene described sentence by sentence, or write your own description and get
          AI feedback.
        </p>
      </header>

      <DescribeGallery />
    </div>
  );
}
