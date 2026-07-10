"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Camera, Repeat2, Sparkles, LogIn, LogOut, Crown, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const links = [
  { href: "/scan", label: "Scan", icon: Camera },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/review", label: "Review", icon: Repeat2 },
  { href: "/stats", label: "Stats", icon: Sparkles },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, sub, login, logout, loading } = useAuth();

  const showLanding = pathname === "/";

  return (
    <>
      {/* Top bar */}
      <nav
        className="sticky top-0 z-40 border-b-2 border-black/5 bg-bg/85 backdrop-blur-xl"
        data-testid="top-navbar"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            href={user ? "/scan" : "/"}
            className="flex items-center gap-2"
            data-testid="brand-link"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-tactile shadow-brand-shadow">
              <BookOpen size={18} strokeWidth={2.5} />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight">Gloss</span>
          </Link>

          <div className="flex items-center gap-2">
            {sub?.isTrialing && (
              <span
                className="hidden items-center gap-1 rounded-full bg-mango/15 px-3 py-1 text-xs font-bold text-mango-shadow sm:inline-flex"
                data-testid="trial-badge"
              >
                <Crown size={12} /> Trial · {sub.daysLeft}d left
              </span>
            )}
            {sub?.isPaid && (
              <span
                className="hidden items-center gap-1 rounded-full bg-leaf/15 px-3 py-1 text-xs font-bold text-leaf-shadow sm:inline-flex"
                data-testid="paid-badge"
              >
                <Crown size={12} /> Pro
              </span>
            )}

            {loading ? null : user ? (
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-black/10 bg-white px-3 py-1.5 text-sm font-bold text-ink hover:bg-black/[0.03]"
                data-testid="logout-button"
                aria-label="Log out"
              >
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.picture} alt="" className="h-5 w-5 rounded-full" />
                ) : (
                  <User size={14} />
                )}
                <LogOut size={14} />
              </button>
            ) : (
              <button
                onClick={login}
                className="btn-tactile bg-brand !py-2 !px-4 text-sm shadow-tactile shadow-brand-shadow"
                data-testid="login-button"
              >
                <LogIn size={14} /> Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom nav (mobile-first) */}
      {!showLanding && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-black/5 bg-white/90 backdrop-blur-xl"
          data-testid="bottom-nav"
        >
          <div className="mx-auto flex max-w-3xl items-stretch justify-between px-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                  className={`flex flex-1 flex-col items-center gap-0.5 px-2 py-3 text-xs font-bold transition-colors ${
                    active ? "text-brand" : "text-ink-soft"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-xl transition-all ${
                      active
                        ? "bg-brand/10 text-brand"
                        : "text-ink-faint hover:bg-black/[0.03]"
                    }`}
                  >
                    <Icon size={20} strokeWidth={2.4} />
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
