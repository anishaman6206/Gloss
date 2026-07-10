import { ScanWorkspace } from "@/components/scan/ScanWorkspace";

export default function ScanPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scan a page</h1>
        <p className="text-sm text-ink/60">
          Tap any word or phrase you don&apos;t know, then get its meaning in context.
        </p>
      </div>
      <ScanWorkspace />
    </div>
  );
}
