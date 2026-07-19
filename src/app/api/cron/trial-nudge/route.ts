import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResendClient } from "@/lib/email/resend";
import { renderTrialNudgeEmail, type TrialNudgeStage } from "@/lib/email/trialNudge";
import { signUnsubscribeToken } from "@/lib/email/unsubscribeToken";
import { TRIAL_PROMO_CODE, TRIAL_PROMO_DISCOUNT_PERCENT } from "@/lib/promoCode";

function baseUrl() {
  return (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
}

function daysLeft(trialEndsAt: Date, now: Date): number {
  return Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const trialingUsers = await prisma.user.findMany({
    where: {
      subscriptionStatus: "trialing",
      trialEndsAt: { not: null },
      reminderEmailsEnabled: true,
      trialNudgeStage: { lt: 2 },
    },
    select: {
      id: true,
      email: true,
      name: true,
      trialEndsAt: true,
      trialNudgeStage: true,
      _count: { select: { words: true, logs: true } },
    },
  });

  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? "Gloss <reminders@usegloss.app>";
  let sent = 0;

  for (const user of trialingUsers) {
    const left = daysLeft(user.trialEndsAt!, now);

    let stage: TrialNudgeStage | null = null;
    if (user.trialNudgeStage < 2 && left <= 0) {
      stage = "lastDay";
    } else if (user.trialNudgeStage < 1 && left <= 3) {
      stage = "midway";
    }
    if (!stage) continue;

    const upgradeUrl =
      stage === "lastDay"
        ? `${baseUrl()}/checkout?plan=monthly&promo=${TRIAL_PROMO_CODE}`
        : `${baseUrl()}/subscribe`;

    const { subject, html, text } = renderTrialNudgeEmail({
      stage,
      name: user.name,
      daysLeft: left,
      wordCount: user._count.words,
      reviewCount: user._count.logs,
      upgradeUrl,
      unsubscribeUrl: `${baseUrl()}/api/unsubscribe?token=${signUnsubscribeToken(user.id)}`,
      promoDiscountPercent: stage === "lastDay" ? TRIAL_PROMO_DISCOUNT_PERCENT : undefined,
    });

    await resend.emails.send({ from, to: user.email, subject, html, text });
    await prisma.user.update({
      where: { id: user.id },
      data: { trialNudgeStage: stage === "lastDay" ? 2 : 1 },
    });
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent });
}
