import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/stats";
import { getResendClient } from "@/lib/email/resend";
import { renderDueReminderEmail } from "@/lib/email/dueReminder";
import { signUnsubscribeToken } from "@/lib/email/unsubscribeToken";

function baseUrl() {
  return (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const today = dateKey(now);

  const dueReviews = await prisma.review.findMany({
    where: { nextReviewAt: { lte: now } },
    select: {
      word: {
        select: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              reminderEmailsEnabled: true,
              lastReminderSentAt: true,
            },
          },
        },
      },
    },
  });

  const dueCountByUser = new Map<string, number>();
  const userById = new Map<
    string,
    { id: string; email: string; name: string; reminderEmailsEnabled: boolean; lastReminderSentAt: Date | null }
  >();

  for (const review of dueReviews) {
    const user = review.word.user;
    if (!user.reminderEmailsEnabled) continue;
    if (user.lastReminderSentAt && dateKey(user.lastReminderSentAt) === today) continue;

    dueCountByUser.set(user.id, (dueCountByUser.get(user.id) ?? 0) + 1);
    userById.set(user.id, user);
  }

  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? "Gloss <noreply@usegloss.app>";
  let sent = 0;

  for (const [userId, dueCount] of dueCountByUser) {
    const user = userById.get(userId)!;
    const { subject, html, text } = renderDueReminderEmail({
      name: user.name,
      dueCount,
      reviewUrl: `${baseUrl()}/review`,
      unsubscribeUrl: `${baseUrl()}/api/unsubscribe?token=${signUnsubscribeToken(userId)}`,
    });

    await resend.emails.send({ from, to: user.email, subject, html, text });
    await prisma.user.update({ where: { id: userId }, data: { lastReminderSentAt: now } });
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent });
}
