export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../lib/db';
import { Variant } from '../../../lib/db/models/Variant';
import { Series } from '../../../lib/db/models/Series';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, created, forbidden, ok, serverError } from '../../../lib/api/respond';

const CreateBody = z.object({
  seriesSlug: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
});

export const GET: APIRoute = async ({ locals, url }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    const seriesSlug = url.searchParams.get('series');
    if (seriesSlug) {
      const series = await Series.findOne({ slug: seriesSlug }).lean();
      if (series) filter.seriesId = series._id;
      else return ok({ variants: [] });
    }
    const variants = await Variant.find(filter)
      .select('slug name status order seriesId updatedAt')
      .sort({ order: 1, name: 1 })
      .lean();
    return ok({ variants });
  } catch (err) {
    console.error('variants GET', err);
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
    const series = await Series.findOne({ slug: parsed.data.seriesSlug.toLowerCase() });
    if (!series) return badRequest('Series not found — create it first');
    const exists = await Variant.findOne({ slug: parsed.data.slug.toLowerCase() });
    if (exists) return badRequest('Variant slug already exists');
    const variant = await Variant.create({
      seriesId: series._id,
      slug: parsed.data.slug.toLowerCase(),
      name: parsed.data.name,
      hero: { title: parsed.data.name, quickStats: [] },
    });
    return created({ variant });
  } catch (err) {
    console.error('variants POST', err);
    return serverError();
  }
};
