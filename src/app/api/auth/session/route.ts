import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const EMERGENT_SESSION_URL =
  "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data";

export async function POST(req: Request) {
  const { sessionId } = (await req.json().catch(() => ({}))) as {
    sessionId?: string;
  };
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "missing_session_id" }, { status: 400 });
  }

  const res = await fetch(EMERGENT_SESSION_URL, {
    headers: { "X-Session-ID": sessionId },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 401 });
  }

  const data = (await res.json()) as {
    id: string;
    email: string;
    name: string;
    picture?: string;
    session_token: string;
  };

  // Upsert user
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: { name: data.name, picture: data.picture ?? null },
    create: {
      email: data.email,
      name: data.name,
      picture: data.picture ?? null,
      subscriptionStatus: "trialing",
      trialEndsAt,
    },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken: data.session_token,
      expiresAt,
    },
  });

  cookies().set(SESSION_COOKIE, data.session_token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    expires: expiresAt,
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  });
}
