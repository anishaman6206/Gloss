import "server-only";

// Comma-separated allowlist, e.g. ADMIN_EMAILS="you@gmail.com,cofounder@gmail.com".
// Falls back to the owner's known email so /admin works without extra setup;
// set the env var (locally and on Vercel) to add more admins or override it.
const DEFAULT_ADMIN_EMAILS = ["anishaman6206@gmail.com"];

function adminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS;
  const emails = fromEnv
    ? fromEnv.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [];
  return emails.length > 0 ? emails : DEFAULT_ADMIN_EMAILS;
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}
