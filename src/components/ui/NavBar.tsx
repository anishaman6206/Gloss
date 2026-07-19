"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Camera,
  Repeat2,
  Sparkles,
  Image as ImageIcon,
  LogIn,
  LogOut,
  Crown,
  User,
  Menu,
  X,
  ChevronDown,
  Flame,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { isWideRoute } from "@/lib/marketingRoutes";

const APP_LINKS = [
  { href: "/scan", label: "Scan", icon: Camera, testId: "nav-scan" },
  { href: "/library", label: "Library", icon: BookOpen, testId: "nav-library" },
  { href: "/review", label: "Review", icon: Repeat2, testId: "nav-review" },
  { href: "/describe", label: "Describe", icon: ImageIcon, testId: "nav-describe" },
  { href: "/stats", label: "Stats", icon: Sparkles, testId: "nav-stats" },
];

const PUBLIC_LINKS = [
  { href: "/", label: "Home", testId: "nav-home" },
  { href: "/describe", label: "Describe", testId: "nav-describe-public" },
  { href: "/pricing", label: "Pricing", testId: "nav-pricing" },
  { href: "/about", label: "About", testId: "nav-about" },
  { href: "/faq", label: "FAQ", testId: "nav-faq" },
];

const CONTACT_LINK = { href: "/contact", label: "Contact", testId: "nav-contact" };

export function NavBar() {
  const pathname = usePathname();
  const { user, sub, streak, login, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Escape closes the drawer, and Tab is trapped to the panel's own
  // focusable links while it's open (it's an overlay, not in-flow content).
  useEffect(() => {
    if (!menuOpen) return;

    const panel = menuPanelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>("a, button");
    focusable?.[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab" || !focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener("click", onClick);
    }

    return () => document.removeEventListener("click", onClick);
  }, [profileOpen]);

  const isAppRoute = APP_LINKS.some((l) => pathname?.startsWith(l.href));
  const isWide = isWideRoute(pathname);
  const links = isWide ? [...PUBLIC_LINKS, CONTACT_LINK] : PUBLIC_LINKS;

  const rightCluster = (
    <div className="flex items-center gap-2">
      {user && (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold sm:px-3 ${
            streak > 0 ? "bg-mango/15 text-mango-shadow" : "bg-black/[0.04] text-ink-faint"
          }`}
          data-testid="streak-badge"
        >
          <Flame size={12} className={streak > 0 ? "animate-wiggle" : ""} />
          {streak}
        </span>
      )}

      {sub?.isTrialing && (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-mango/15 px-2.5 py-1 text-xs font-bold text-mango-shadow sm:px-3"
          data-testid="trial-badge"
        >
          <Crown size={12} />
          <span className="sm:hidden">{sub.daysLeft}d</span>
          <span className="hidden sm:inline">Trial · {sub.daysLeft}d</span>
        </span>
      )}

      {sub?.isPaid && (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-leaf/15 px-2.5 py-1 text-xs font-bold text-leaf-shadow sm:px-3"
          data-testid="paid-badge"
        >
          <Crown size={12} /> Pro
        </span>
      )}

      {loading ? null : user ? (
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-black/10 bg-white px-2.5 py-1.5 text-sm font-bold text-ink hover:bg-black/[0.03]"
            data-testid="profile-menu-button"
            aria-label="Open profile menu"
          >
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt="" className="h-5 w-5 rounded-full" />
            ) : (
              <User size={14} />
            )}

            <ChevronDown size={12} />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border-2 border-black/5 bg-white shadow-tactile shadow-black/10"
              data-testid="profile-menu"
            >
              <div className="border-b-2 border-black/5 px-3 py-2.5">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="truncate text-xs text-ink-faint">{user.email}</p>
              </div>

              <Link
                href="/profile"
                data-testid="menu-profile"
                className="block px-3 py-2.5 text-sm font-bold text-ink hover:bg-black/[0.03]"
              >
                Profile
              </Link>

              <button
                onClick={logout}
                data-testid="logout-button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-bold text-cherry hover:bg-cherry/[0.08]"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={login}
          className="btn-tactile bg-brand !px-4 !py-2 text-sm shadow-tactile shadow-brand-shadow"
          data-testid="login-button"
        >
          <LogIn size={14} /> Sign in
        </button>
      )}

      <button
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu-panel"
        className="grid h-9 w-9 place-items-center rounded-xl border-2 border-black/10 bg-white text-ink lg:hidden"
        data-testid="mobile-menu-toggle"
      >
        {menuOpen ? <X size={16} /> : <Menu size={16} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Top bar */}
      <nav
        className="sticky top-0 z-40 border-b-2 border-black/5 bg-bg/85 backdrop-blur-xl relative"
        data-testid="top-navbar"
      >
        <div
          className={`relative mx-auto flex items-center justify-between gap-3 px-4 ${
            isWide ? "max-w-7xl py-2.5" : "max-w-3xl py-3"
          }`}
        >
          <Link href="/" className="flex items-center gap-2" data-testid="brand-link">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-tactile shadow-brand-shadow">
              <BookOpen size={18} strokeWidth={2.5} />
            </span>

            <span className="font-display text-2xl font-bold tracking-tight">Gloss</span>
          </Link>

          {isWide ? (
            <div className="flex items-center gap-3 lg:gap-6">
              {/* Desktop links, on the right side next to the profile/CTA cluster */}
              <div className="hidden items-center gap-1 lg:flex">
                {links.map((link) => {
                  const active = pathname === link.href;
                  const isPricing = link.href === "/pricing";

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      data-testid={`desktop-${link.testId}`}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-colors duration-150 ${
                        active
                          ? "bg-brand/10 text-brand-shadow"
                          : isPricing
                            ? "text-mango-shadow hover:bg-mango/10"
                            : "text-ink-soft hover:bg-black/[0.03] hover:text-ink"
                      }`}
                    >
                      {link.label}
                      {isPricing && !active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-mango" aria-hidden="true" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {rightCluster}
            </div>
          ) : (
            <>
              {/* Desktop links, centered independently of the logo/profile widths */}
              <div className="hidden items-center gap-1 lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2">
                {links.map((link) => {
                  const active = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      data-testid={`desktop-${link.testId}`}
                      className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                        active
                          ? "bg-brand/10 text-brand-shadow"
                          : "text-ink-soft hover:bg-black/[0.03] hover:text-ink"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {rightCluster}
            </>
          )}
        </div>

        {/* Mobile menu: an overlay drawer (backdrop + absolutely-positioned
            panel) rather than in-flow content, so opening it never pushes
            the page below down. */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                key="mobile-menu-backdrop"
                className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <motion.div
                key="mobile-menu-panel"
                ref={menuPanelRef}
                id="mobile-menu-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className="absolute inset-x-0 top-full z-40 border-t-2 border-black/5 bg-white px-4 py-3 shadow-tactile shadow-black/10 lg:hidden"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                data-testid="mobile-menu"
              >
                <ul
                  className={`mx-auto max-w-3xl ${isWide ? "space-y-1.5" : "space-y-1"}`}
                >
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        data-testid={`mobile-${link.testId}`}
                        className={`block rounded-xl font-bold transition-colors duration-150 ${
                          isWide ? "px-4 py-3 text-base" : "px-3 py-2.5 text-sm"
                        } ${
                          pathname === link.href
                            ? "bg-brand/10 text-brand-shadow"
                            : "text-ink hover:bg-black/[0.03]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Secondary app nav (tablet/desktop) - mirrors the bottom nav's links
          for screens where the bottom nav is hidden (md:hidden). */}
      {isAppRoute && (
        <div
          className="hidden border-b-2 border-black/5 bg-white/80 backdrop-blur-xl md:block"
          data-testid="app-navbar"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-1 px-4 py-2">
            {APP_LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`desktop-${link.testId}`}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                    active
                      ? "bg-brand/10 text-brand-shadow"
                      : "text-ink-soft hover:bg-black/[0.03] hover:text-ink"
                  }`}
                >
                  <Icon size={15} strokeWidth={2.4} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom nav (mobile-first) - only on app routes */}
      {isAppRoute && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-black/5 bg-white/90 backdrop-blur-xl md:hidden"
          data-testid="bottom-nav"
        >
          <div className="mx-auto flex max-w-3xl items-stretch justify-between px-2">
            {APP_LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={link.testId}
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
