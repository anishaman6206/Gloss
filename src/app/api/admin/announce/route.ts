import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getResendClient } from "@/lib/email/resend";
import { renderAnnouncementEmail } from "@/lib/email/announcement";
import { signUnsubscribeToken } from "@/lib/email/unsubscribeToken";

function baseUrl() {
  return (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
}

type AnnounceBody = {
  subject?: string;
  heading?: string;
  message?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  dryRun?: boolean;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: AnnounceBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const subject = (body.subject ?? "").trim();
  const heading = (body.heading ?? "").trim();
  const message = (body.message ?? "").trim();
  const ctaLabel = body.ctaLabel?.trim() || undefined;
  const ctaUrl = body.ctaUrl?.trim() || undefined;

  if (!subject || !heading || !message) {
    return NextResponse.json(
      { ok: false, error: "Subject, heading, and message are required." },
      { status: 400 }
    );
  }

  const recipients = await prisma.user.findMany({
    where: { announcementEmailsEnabled: true },
    select: { id: true, email: true, name: true },
  });

  if (body.dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, total: recipients.length });
  }

  const resend = getResendClient();
  const from = process.env.EMAIL_FROM_ANNOUNCE ?? "Gloss <updates@usegloss.app>";

  let sent = 0;
  const failedEmails: string[] = [];

  for (const recipient of recipients) {
    const { html, text } = renderAnnouncementEmail({
      name: recipient.name,
      heading,
      bodyText: message,
      ctaLabel,
      ctaUrl,
      unsubscribeUrl: `${baseUrl()}/api/unsubscribe?token=${signUnsubscribeToken(recipient.id)}`,
    });

    try {
      await resend.emails.send({ from, to: recipient.email, subject, html, text });
      sent += 1;
    } catch (err) {
      console.error(`Failed to send announcement to ${recipient.email}`, err);
      failedEmails.push(recipient.email);
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun: false,
    total: recipients.length,
    sent,
    failed: failedEmails.length,
  });
}
