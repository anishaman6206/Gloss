import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: session.user?.name ?? "",
      picture: session.user?.image ?? null,
    },
    create: {
      email,
      name: session.user?.name ?? "",
      picture: session.user?.image ?? null,
      subscriptionStatus: "trialing",
      trialEndsAt,
    },
  });

  const sessionToken = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken,
      expiresAt,
    },
  });

  cookies().set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    expires: expiresAt,
  });

  return NextResponse.redirect(new URL("/scan", req.url));
}
