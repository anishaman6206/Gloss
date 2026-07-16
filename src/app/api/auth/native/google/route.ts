import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { establishSession } from "@/lib/auth";

// Counterpart to /api/auth/bootstrap for the Median in-app browser: NextAuth
// never runs here (there's no OAuth redirect inside the native webview).
// Median's redirectUri mode is used instead of its JS-callback mode
// specifically because the native account picker can recreate the webview's
// JS context, which would silently drop an in-memory callback closure. A
// real navigation with the token on the URL has no such dependency, and
// matches bootstrap's own GET-then-redirect shape.
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idToken = searchParams.get("idToken");
  if (!idToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!payload?.email || !payload.email_verified) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  await establishSession({
    email: payload.email,
    name: payload.name ?? "",
    picture: payload.picture ?? null,
  });

  return NextResponse.redirect(new URL("/scan", req.url));
}
