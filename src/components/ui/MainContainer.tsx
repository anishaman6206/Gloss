"use client";

import { usePathname } from "next/navigation";
import { MARKETING_ROUTES } from "@/lib/marketingRoutes";

export function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isMarketing = pathname !== null && MARKETING_ROUTES.includes(pathname);

  if (isLanding) {
    return <main data-testid="app-main">{children}</main>;
  }

  if (isMarketing) {
    return (
      <main
        className="mx-auto max-w-7xl px-6 pb-10 pt-8 lg:px-8 lg:pt-10"
        data-testid="app-main"
      >
        {children}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-6 pt-6" data-testid="app-main">
      {children}
    </main>
  );
}
