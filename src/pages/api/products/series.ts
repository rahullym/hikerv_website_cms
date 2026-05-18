export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../lib/db';
import { Series } from '../../../lib/db/models/Series';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, created, forbidden, ok, serverError } from '../../../lib/api/respond';

const CreateBody = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  accentColor: z.string().optional(),
  order: z.number().int().optional(),
});

export const GET: APIRoute = async ({ locals }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  try {
    await connectDB();
    const series = await Series.find().sort({ order: 1, name: 1 }).lean();
    return ok({ series });
  } catch (err) {
    console.error('series GET', err);
    return serverError();
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
  try {
    await connectDB();
    const exists = await Series.findOne({ slug: parsed.data.slug.toLowerCase() });
    if (exists) return badRequest('Series with this slug already exists');
    const series = await Series.create({
      ...parsed.data,
      slug: parsed.data.slug.toLowerCase(),
      accentColor: parsed.data.accentColor ?? '#E50000',
      order: parsed.data.order ?? 0,
    });
    return created({ series });
  } catch (err) {
    console.error('series POST', err);
    return serverError();
  }
};
