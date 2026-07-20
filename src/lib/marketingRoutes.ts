// Routes that get the wide, landing-style container (NavBar, Footer,
// MainContainer all key off this) instead of the narrower app-page width.
export const MARKETING_ROUTES = [
  "/about",
  "/faq",
  "/pricing",
  "/contact",
  "/privacy",
  "/terms",
  "/refund-policy",
];

export function isWideRoute(pathname: string | null): boolean {
  return pathname === "/" || (pathname !== null && MARKETING_ROUTES.includes(pathname));
}

// In-app pages (scan/library/review/describe/stats and their subroutes).
const APP_ROUTE_PREFIXES = ["/scan", "/library", "/review", "/describe", "/stats"];

export function isAppRoute(pathname: string | null): boolean {
  return pathname !== null && APP_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));
}

// Routes that use the wide, home-style container and footer width. Wraps
// isWideRoute (landing + marketing) to also include the in-app pages and
// profile, so page width and footer size stay consistent everywhere.
export function isWideLayoutRoute(pathname: string | null): boolean {
  return isWideRoute(pathname) || isAppRoute(pathname) || pathname === "/profile";
}
