import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribeToken";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const userId = verifyUnsubscribeToken(token);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { reminderEmailsEnabled: false, announcementEmailsEnabled: false },
  });

  return new NextResponse(
    "<!doctype html><html><body style=\"font-family: -apple-system, sans-serif; text-align: center; padding: 60px 20px;\"><p>You won't get any more emails from Gloss. You can turn individual ones back on anytime from your profile.</p></body></html>",
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
