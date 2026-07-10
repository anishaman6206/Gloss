import { getCurrentUser } from "@/lib/auth";
import { ScanWorkspace } from "@/components/scan/ScanWorkspace";
import { AuthGate } from "@/components/auth/AuthGate";
import { Camera } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  const user = await getCurrentUser();
  if (!user) return <AuthGate />;

  return (
    <div className="space-y-6" data-testid="scan-page">
      <header className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-shadow">
              <Camera size={12} /> Scan
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              What are you reading today?
            </h1>
            <p className="mt-1 text-ink-soft">
              Snap a page. Tap what you don&apos;t know. Meanings arrive in context.
            </p>
          </div>
        </div>
      </header>
      <ScanWorkspace />
    </div>
  );
}
