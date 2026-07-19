import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: "brand" | "mango" | "leaf" | "cherry";
  "data-testid"?: string;
  children?: React.ReactNode;
};

const ACCENT_MAP = {
  brand: { pill: "bg-brand/15 text-brand-shadow", blobA: "bg-brand/10", blobB: "bg-mango/10" },
  mango: { pill: "bg-mango/15 text-mango-shadow", blobA: "bg-mango/10", blobB: "bg-brand/10" },
  leaf: { pill: "bg-leaf/15 text-leaf-shadow", blobA: "bg-leaf/10", blobB: "bg-brand/10" },
  cherry: { pill: "bg-cherry/10 text-cherry", blobA: "bg-cherry/10", blobB: "bg-brand/10" },
};

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  accent = "brand",
  children,
  ...rest
}: Props) {
  const a = ACCENT_MAP[accent];

  return (
    <header
      className="relative overflow-hidden py-10 text-center md:py-14"
      data-testid={rest["data-testid"] ?? "page-header"}
    >
      <div
        className={`pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/3 -translate-y-1/3 rounded-full ${a.blobA} blur-[100px]`}
      />
      <div
        className={`pointer-events-none absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full ${a.blobB} blur-[100px]`}
      />

      <div className="relative mx-auto max-w-2xl">
        <span
          className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${a.pill}`}
        >
          <Icon size={12} /> {eyebrow}
        </span>

        <h1 className="relative mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          {title}
        </h1>

        {subtitle && (
          <p className="relative mx-auto mt-3 max-w-xl text-lg text-ink-soft md:text-xl">
            {subtitle}
          </p>
        )}

        {children && <div className="relative mt-6">{children}</div>}
      </div>
    </header>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5 md:p-8">
      <div className="prose-gloss space-y-5 text-ink">{children}</div>
    </div>
  );
}
