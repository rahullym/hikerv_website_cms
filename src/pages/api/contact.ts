export const prerender = false;

import type { APIRoute } from 'astro';
import { connectDB } from '../../lib/db';
import { Lead } from '../../lib/db/models/Lead';
import { hasRole } from '../../lib/auth/session';
import { sendNotification } from '../../lib/email';
import { LeadInput, toLeadRecord, buildLeadEmail } from '../../lib/leads';
import { badRequest, created, forbidden, ok, serverError } from '../../lib/api/respond';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const parsed = LeadInput.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
  if (parsed.data.website) return ok({ received: true });

  try {
    await connectDB();
    const ip = clientAddress ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? undefined;
    const userAgent = request.headers.get('user-agent') ?? undefined;
    const data = { ...toLeadRecord(parsed.data), ip, userAgent };

    const lead = await Lead.create(data);

    const { subject, html } = buildLeadEmail(data);
    sendNotification({ subject, html, replyTo: data.email })
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
