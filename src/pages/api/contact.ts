export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../lib/db';
import { Lead } from '../../lib/db/models/Lead';
import { hasRole } from '../../lib/auth/session';
import { sendNotification, escapeHtml } from '../../lib/email';
import { badRequest, created, forbidden, ok, serverError } from '../../lib/api/respond';

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(1).max(40),
  model: z.string().max(80).optional().or(z.literal('')),
  size: z.string().max(20).optional().or(z.literal('')),
  state: z.string().max(40).optional().or(z.literal('')),
  message: z.string().max(4000).optional().or(z.literal('')),
  source: z.string().max(40).optional(),
  website: z.string().optional(), // honeypot — silently no-op if filled
});

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
  if (parsed.data.website) return ok({ received: true });

  try {
    await connectDB();
    const ip = clientAddress ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? undefined;
    const userAgent = request.headers.get('user-agent') ?? undefined;
    const data = {
      name: parsed.data.name.trim(),
      email: parsed.data.email.toLowerCase().trim(),
      phone: parsed.data.phone.trim(),
      model: parsed.data.model?.trim() || undefined,
      size: parsed.data.size?.trim() || undefined,
      state: parsed.data.state?.trim() || undefined,
      message: parsed.data.message?.trim() || undefined,
      source: parsed.data.source?.trim() || 'contact',
      ip,
      userAgent,
    };

    const lead = await Lead.create(data);

    sendNotification({
      subject: `New enquiry: ${data.name} — ${data.model ?? 'no model selected'}`,
      replyTo: data.email,
      html: `
        <h2 style="margin:0 0 12px;font-family:system-ui">New Hike RV enquiry</h2>
        <table cellpadding="6" style="font-family:system-ui;font-size:14px;border-collapse:collapse">
          <tr><td><strong>Name</strong></td><td>${escapeHtml(data.name)}</td></tr>
          <tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
          <tr><td><strong>Phone</strong></td><td>${escapeHtml(data.phone)}</td></tr>
          <tr><td><strong>Model</strong></td><td>${escapeHtml(data.model ?? '')}</td></tr>
          <tr><td><strong>Size</strong></td><td>${escapeHtml(data.size ?? '')}</td></tr>
          <tr><td><strong>State</strong></td><td>${escapeHtml(data.state ?? '')}</td></tr>
          <tr><td valign="top"><strong>Message</strong></td><td>${escapeHtml(data.message ?? '').replace(/\n/g, '<br/>')}</td></tr>
        </table>
        <p style="color:#666;font-size:12px;margin-top:18px">View all enquiries in the Hike RV CMS at /admin/leads</p>
      `,
    })
      .then((r) => {
        if (!r.sent) console.warn('[contact] email notification not sent:', r.reason);
      })
      .catch((err) => console.warn('[contact] email notification error:', (err as Error).message));

    return created({ received: true, id: lead._id.toString() });
  } catch (err) {
    console.error('contact POST', err);
    return serverError();
  }
};

export const GET: APIRoute = async ({ locals, url }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  try {
    await connectDB();
    const status = url.searchParams.get('status');
    const filter: Record<string, unknown> = {};
    if (status && ['new', 'contacted', 'closed'].includes(status)) filter.status = status;
    const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    return ok({ leads, total: leads.length });
  } catch (err) {
    console.error('leads GET', err);
    return serverError();
  }
};
