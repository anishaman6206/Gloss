import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResendClient } from "@/lib/email/resend";
import { renderContactNotificationEmail } from "@/lib/email/contactNotification";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();

  if (
    name.length < 2 ||
    !EMAIL_RE.test(email) ||
    subject.length < 3 ||
    message.length < 10
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please fill every field with a real value.",
      },
      {
        status: 400,
      }
    );
  }

  await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject,
      message,
    },
  });

  // Best-effort notification — the message is already safely stored above,
  // so a Resend/config problem here should never fail the user's submission.
  try {
    const resend = getResendClient();
    const from = process.env.EMAIL_FROM ?? "Gloss <noreply@usegloss.app>";
    const to = process.env.SUPPORT_EMAIL ?? "gloss.theta@gmail.com";
    const { subject: mailSubject, html, text } = renderContactNotificationEmail({
      name,
      email,
      subject,
      message,
    });
    await resend.emails.send({ from, to, replyTo: email, subject: mailSubject, html, text });
  } catch (err) {
    console.error("Failed to send contact notification email", err);
  }

  return NextResponse.json({
    ok: true,
  });
}