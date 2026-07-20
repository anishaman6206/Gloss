import { Sparkles } from "lucide-react";
import { describeImages, DESCRIBE_CATEGORIES } from "@/data/describeImages";
import { DescribeRow } from "./DescribeRow";

export function DescribeGallery() {
  const generalImages = describeImages.filter((img) => img.category === "general");
  const comingSoon = DESCRIBE_CATEGORIES.filter(
    (c) => c.id !== "general" && describeImages.every((img) => img.category !== c.id)
  );

  return (
    <div className="space-y-10" data-testid="describe-gallery">
      <DescribeRow title="Scenes to describe" images={generalImages} />

      {comingSoon.length > 0 && (
        <div data-testid="describe-coming-soon-row">
          <h3 className="mb-3 font-display text-xl font-bold">More packs on the way</h3>

          <div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {comingSoon.map((c) => (
              <div
                key={c.id}
                data-testid={`describe-category-${c.id}`}
                className="flex w-56 shrink-0 snap-start flex-col items-start gap-2 rounded-2xl border-2 border-dashed border-black/10 bg-white/60 p-5 sm:w-64"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-mango/10 text-mango">
                  <Sparkles size={18} strokeWidth={2.4} />
                </span>
                <p className="font-display text-base font-bold">{c.label}</p>
                <p className="text-xs text-ink-faint">{c.comingSoonNote}</p>
                <span className="mt-1 rounded-full bg-black/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-faint">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
