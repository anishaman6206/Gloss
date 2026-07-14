"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Mail, Sparkles } from "lucide-react";

const SECTIONS: {
  title: string;
  links: { label: string; href: string; testId: string }[];
}[] = [
  {
    title: "Product",
    links: [
      { label: "Home", href: "/", testId: "footer-home" },
      { label: "Pricing", href: "/pricing", testId: "footer-pricing" },
      { label: "About", href: "/about", testId: "footer-about" },
      { label: "FAQ", href: "/faq", testId: "footer-faq" },
      { label: "Contact", href: "/contact", testId: "footer-contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy", testId: "footer-privacy" },
      { label: "Terms & Conditions", href: "/terms", testId: "footer-terms" },
      { label: "Refund Policy", href: "/refund-policy", testId: "footer-refund" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();

  // Hide footer inside review sessions to keep focus.
  if (pathname?.startsWith("/review")) return null;

  return (
    <footer
      className="mx-auto mt-24 max-w-3xl px-4 pb-28 md:pb-14"
      data-testid="site-footer"
    >
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-black/5 bg-white p-8 shadow-tactile shadow-black/5 md:p-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brand/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-mango/15 blur-3xl" />

        <div className="relative grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2"
              data-testid="footer-brand"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white shadow-tactile shadow-brand-shadow">
                <BookOpen size={18} strokeWidth={2.5} />
              </span>
              <span className="font-display text-2xl font-bold tracking-tight">
                Gloss
              </span>
            </Link>

            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              Helping readers remember every new word they discover.
            </p>

            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-faint">
              <Sparkles size={12} className="text-mango" />
              Made for readers, not scrollers.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                {section.title}
              </p>

              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      data-testid={link.testId}
                      className="text-sm font-medium text-ink hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
              Support
            </p>

            <a
              href="mailto:gloss.ai@gmail.com"
              data-testid="footer-support-email"
              className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-black/[0.03] px-3 py-2 text-sm font-bold text-ink hover:bg-black/[0.05]"
            >
              <Mail size={14} className="text-brand" />
              gloss.ai@gmail.com
            </a>
          </div>
        </div>

        <div className="relative mt-8 border-t-2 border-black/5 pt-4 text-xs text-ink-faint">
          © {new Date().getFullYear()} Gloss. All rights reserved.
        </div>
      </div>
    </footer>
  );
}