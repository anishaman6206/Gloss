"use client";

import { usePathname } from "next/navigation";

export function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <main data-testid="app-main">{children}</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-6 pt-6" data-testid="app-main">
      {children}
    </main>
  );
}
