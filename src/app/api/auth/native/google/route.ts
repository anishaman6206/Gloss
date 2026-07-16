import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { establishSession } from "@/lib/auth";

// Counterpart to /api/auth/bootstrap for the Median in-app browser: NextAuth
// never runs here (there's no OAuth redirect inside the native webview), so
// the client instead hands us the raw Google ID token it got from
// median.socialLogin.google.login(), and we verify it ourselves before
// creating the exact same session bootstrap does.
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  const { idToken } = await req.json().catch(() => ({ idToken: null }));
  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ ok: false, error: "missing_id_token" }, { status: 400 });
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_id_token" }, { status: 401 });
  }

  if (!payload?.email || !payload.email_verified) {
    return NextResponse.json({ ok: false, error: "email_not_verified" }, { status: 401 });
  }

  await establishSession({
    email: payload.email,
    name: payload.name ?? "",
    picture: payload.picture ?? null,
  });

  return NextResponse.json({ ok: true });
}
