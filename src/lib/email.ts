type SendArgs = {
  subject: string;
  html: string;
  replyTo?: string;
};

const FROM = import.meta.env.NOTIFY_FROM_EMAIL ?? 'Hike RV <onboarding@resend.dev>';
const TO = import.meta.env.NOTIFY_EMAIL ?? import.meta.env.BOOTSTRAP_ADMIN_EMAIL;
const KEY = import.meta.env.RESEND_API_KEY;

export async function sendNotification({ subject, html, replyTo }: SendArgs): Promise<{ sent: boolean; reason?: string }> {
  if (!KEY) return { sent: false, reason: 'RESEND_API_KEY not configured' };
  if (!TO) return { sent: false, reason: 'NOTIFY_EMAIL not configured' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { sent: false, reason: `Resend ${res.status}: ${text.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: (err as Error).message };
  }
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
