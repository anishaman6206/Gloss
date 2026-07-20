import type { WordStatus } from "@/lib/types";

const STATUS_LABEL: Record<WordStatus, string> = {
  new: "New",
  learning: "Learning",
  learned: "Learned",
};

const STATUS_STYLE: Record<WordStatus, string> = {
  new: "bg-brand/10 text-brand-shadow",
  learning: "bg-mango/15 text-mango-shadow",
  learned: "bg-leaf/15 text-leaf-shadow",
};

export function StatusBadge({ status }: { status: WordStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_STYLE[status]}`}
      data-testid={`status-badge-${status}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
