import { tagColor } from "@/lib/tagColor";

const CHIP_STYLE: Record<string, string> = {
  brand: "bg-brand/10 text-brand-shadow",
  mango: "bg-mango/15 text-mango-shadow",
  leaf: "bg-leaf/15 text-leaf-shadow",
  cherry: "bg-cherry/10 text-cherry-shadow",
  grape: "bg-grape/15 text-grape-shadow",
};

export function TagChip({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${CHIP_STYLE[tagColor(tag)]}`}
      data-testid={`tag-chip-${tag}`}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove tag ${tag}`}
          className="ml-0.5 leading-none opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </span>
  );
}
