import "server-only";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderContactNotificationEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): { subject: string; html: string; text: string } {
  const mailSubject = `Contact form: ${subject}`;

  const text = `New contact form message.\n\nFrom: ${name} <${email}>\nSubject: ${subject}\n\n${message}`;

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <p>New message from the Gloss contact form.</p>
      <p style="margin: 16px 0; padding: 12px 16px; background: #f5f5f5; border-radius: 12px;">
        <strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;<br/>
        <strong>Subject:</strong> ${escapeHtml(subject)}
      </p>
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `.trim();

  return { subject: mailSubject, html, text };
}
