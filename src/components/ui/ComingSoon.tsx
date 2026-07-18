import Link from "next/link";
import { ArrowLeft, Sparkles, type LucideIcon } from "lucide-react";

const TINTS = {
  brand: "bg-brand/15 text-brand-shadow",
  mango: "bg-mango/15 text-mango-shadow",
  leaf: "bg-leaf/15 text-leaf-shadow",
  cherry: "bg-cherry/10 text-cherry",
} as const;

export function ComingSoon({
  icon: Icon,
  title,
  description,
  accent = "brand",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: keyof typeof TINTS;
}) {
  return (
    <div className="mx-auto max-w-lg" data-testid="coming-soon-page">
      <Link
        href="/"
        data-testid="coming-soon-back"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={14} /> Home
      </Link>

      <div className="relative mt-4 overflow-hidden rounded-[2rem] border-2 border-black/5 bg-white p-10 text-center shadow-tactile shadow-black/5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-mango/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-brand/20 blur-3xl" />

        <div className="relative">
          <span
            className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl animate-floaty ${TINTS[accent]}`}
          >
            <Icon size={26} strokeWidth={2.4} />
          </span>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink-faint">
            <Sparkles size={12} /> Coming soon
          </span>

          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-ink-soft">{description}</p>
        </div>
      </div>
    </div>
  );
}
