import "server-only";

export function renderDueReminderEmail({
  name,
  dueCount,
  reviewUrl,
  unsubscribeUrl,
}: {
  name: string;
  dueCount: number;
  reviewUrl: string;
  unsubscribeUrl: string;
}): { subject: string; html: string; text: string } {
  const word = dueCount === 1 ? "word" : "words";
  const subject = `${dueCount} ${word} due today`;

  const text = `Hi ${name},\n\nYou have ${dueCount} ${word} waiting for review in Gloss. A quick review now keeps them from slipping out of memory.\n\nReview now: ${reviewUrl}\n\nDon't want these emails? Unsubscribe: ${unsubscribeUrl}`;

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <p>Hi ${name},</p>
      <p>You have <strong>${dueCount} ${word}</strong> waiting for review in Gloss. A quick review now keeps them from slipping out of memory.</p>
      <p style="margin: 24px 0;">
        <a href="${reviewUrl}" style="background: #ff6b35; color: #fff; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: bold;">
          Review now
        </a>
      </p>
      <p style="font-size: 12px; color: #888; margin-top: 32px;">
        Don't want these emails? <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
      </p>
    </div>
  `.trim();

  return { subject, html, text };
}
