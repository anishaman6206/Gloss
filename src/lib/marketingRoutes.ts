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
