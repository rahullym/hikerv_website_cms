export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../lib/db';
import { Subscriber } from '../../lib/db/models/Subscriber';
import { hasRole } from '../../lib/auth/session';
import { sendNotification, escapeHtml } from '../../lib/email';
import { badRequest, created, forbidden, ok, serverError } from '../../lib/api/respond';

const Body = z.object({
  email: z.string().email(),
  // honeypot field — bots fill it, humans don't see it. Accept any
  // value so bots get a normal-looking 200 response, then no-op below.
  website: z.string().optional(),
});

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) return badRequest('Valid email required');
  if (parsed.data.website) return ok({ subscribed: true }); // silent honeypot

  try {
    await connectDB();
    const email = parsed.data.email.toLowerCase();
    const userAgent = request.headers.get('user-agent') ?? undefined;
    const ip = clientAddress ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? undefined;

    const existing = await Subscriber.findOne({ email });
    if (existing) return ok({ subscribed: true, alreadySubscribed: true });

    const sub = await Subscriber.create({ email, source: 'newsletter', ip, userAgent });

    // Fire-and-forget email — never block the response on it
    sendNotification({
      subject: `New newsletter subscriber: ${email}`,
      html: `
        <p>A new subscriber just joined the Hike RV newsletter.</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>When:</strong> ${new Date().toISOString()}</p>
        <hr/>
        <p style="color:#666;font-size:12px">View all subscribers in the Hike RV CMS at /admin/subscribers</p>
      `,
    }).catch(() => {});

    return created({ subscribed: true, id: sub._id.toString() });
  } catch (err) {
    console.error('subscribe POST', err);
    return serverError();
  }
};

export const GET: APIRoute = async ({ locals }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  try {
    await connectDB();
    const subscribers = await Subscriber.find()
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();
    return ok({ subscribers, total: subscribers.length });
  } catch (err) {
    console.error('subscribers GET', err);
    return serverError();
  }
};
