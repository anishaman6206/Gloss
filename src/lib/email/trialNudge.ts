import "server-only";

export type TrialNudgeStage = "midway" | "lastDay";

export function renderTrialNudgeEmail({
  stage,
  name,
  daysLeft,
  wordCount,
  reviewCount,
  upgradeUrl,
  unsubscribeUrl,
  promoDiscountPercent,
}: {
  stage: TrialNudgeStage;
  name: string;
  daysLeft: number;
  wordCount: number;
  reviewCount: number;
  upgradeUrl: string;
  unsubscribeUrl: string;
  promoDiscountPercent?: number;
}): { subject: string; html: string; text: string } {
  const hasActivity = wordCount > 0 || reviewCount > 0;
  const activityLine = hasActivity
    ? `So far you've saved <strong>${wordCount} word${wordCount === 1 ? "" : "s"}</strong> and done <strong>${reviewCount} review${reviewCount === 1 ? "" : "s"}</strong>. Upgrading keeps that progress going without a gap.`
    : `Upgrading keeps your progress going without a gap, whenever you start adding words.`;
  const activityLineText = hasActivity
    ? `So far you've saved ${wordCount} word${wordCount === 1 ? "" : "s"} and done ${reviewCount} review${reviewCount === 1 ? "" : "s"}. Upgrading keeps that progress going without a gap.`
    : `Upgrading keeps your progress going without a gap, whenever you start adding words.`;

  const subject =
    stage === "lastDay"
      ? promoDiscountPercent
        ? `Your Gloss trial ends today — ${promoDiscountPercent}% off if you upgrade now`
        : "Your Gloss trial ends today"
      : `${daysLeft} days left on your Gloss trial`;

  const intro =
    stage === "lastDay"
      ? `Your free trial on Gloss ends today.`
      : `You've got ${daysLeft} days left on your free trial.`;

  const priceLine = promoDiscountPercent
    ? `As a thank-you for trying Gloss, upgrade today and get ${promoDiscountPercent}% off. Plans normally start at ₹39/month.`
    : `Plans start at ₹39/month.`;
  const priceLineHtml = promoDiscountPercent
    ? `As a thank-you for trying Gloss, upgrade today and get <strong>${promoDiscountPercent}% off</strong>. Plans normally start at &#8377;39/month.`
    : `Plans start at &#8377;39/month.`;
  const ctaLabel = promoDiscountPercent ? `Upgrade & save ${promoDiscountPercent}%` : "Upgrade to Pro";

  const text = `Hi ${name},\n\n${intro} ${activityLineText}\n\n${priceLine}\n\n${ctaLabel}: ${upgradeUrl}\n\nDon't want these emails? Unsubscribe: ${unsubscribeUrl}`;

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <p>Hi ${name},</p>
      <p>${intro} ${activityLine}</p>
      <p>${priceLineHtml}</p>
      <p style="margin: 24px 0;">
        <a href="${upgradeUrl}" style="background: #ff6b35; color: #fff; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: bold;">
          ${ctaLabel}
        </a>
      </p>
      <p style="font-size: 12px; color: #888; margin-top: 32px;">
        Don't want these emails? <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
      </p>
    </div>
  `.trim();

  return { subject, html, text };
}
