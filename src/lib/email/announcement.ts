import "server-only";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderAnnouncementEmail({
  name,
  heading,
  bodyText,
  ctaLabel,
  ctaUrl,
  unsubscribeUrl,
}: {
  name: string;
  heading: string;
  bodyText: string;
  ctaLabel?: string;
  ctaUrl?: string;
  unsubscribeUrl: string;
}): { html: string; text: string } {
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const text = [
    `Hi ${name},`,
    "",
    heading,
    "",
    ...paragraphs,
    ...(ctaUrl ? ["", `${ctaLabel ?? "Check it out"}: ${ctaUrl}`] : []),
    "",
    `Don't want these emails? Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <p>Hi ${name},</p>
      <h2 style="margin: 16px 0 8px; font-size: 20px;">${escapeHtml(heading)}</h2>
      ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n")}
      ${
        ctaUrl
          ? `<p style="margin: 24px 0;">
              <a href="${ctaUrl}" style="background: #ff6b35; color: #fff; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: bold;">
                ${escapeHtml(ctaLabel ?? "Check it out")}
              </a>
            </p>`
          : ""
      }
      <p style="font-size: 12px; color: #888; margin-top: 32px;">
        Don't want these emails? <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
      </p>
    </div>
  `.trim();

  return { html, text };
}
