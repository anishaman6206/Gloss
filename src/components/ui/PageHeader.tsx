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
  brand: {
    pill: "bg-brand/15 text-brand-shadow",
    blob: "bg-brand/25",
  },
  mango: {
    pill: "bg-mango/15 text-mango-shadow",
    blob: "bg-mango/25",
  },
  leaf: {
    pill: "bg-leaf/15 text-leaf-shadow",
    blob: "bg-leaf/25",
  },
  cherry: {
    pill: "bg-cherry/10 text-cherry",
    blob: "bg-cherry/20",
  },
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
      className="relative overflow-hidden rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5 md:p-8"
      data-testid={rest["data-testid"] ?? "page-header"}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full ${a.blob} blur-3xl`}
      />

      <span
        className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${a.pill}`}
      >
        <Icon size={12} /> {eyebrow}
      </span>

      <h1 className="relative mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h1>

      {subtitle && (
        <p className="relative mt-1 text-ink-soft md:text-lg">
          {subtitle}
        </p>
      )}

      {children && <div className="relative mt-4">{children}</div>}
    </header>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5 md:p-8">
      <div className="prose-gloss space-y-5 text-ink">
        {children}
      </div>
    </div>
  );
}