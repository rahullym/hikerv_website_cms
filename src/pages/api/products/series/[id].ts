export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../../lib/db';
import { Series } from '../../../../lib/db/models/Series';
import { Variant } from '../../../../lib/db/models/Variant';
import { hasRole } from '../../../../lib/auth/session';
import { badRequest, forbidden, notFound, ok, serverError } from '../../../../lib/api/respond';

const PatchBody = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  accentColor: z.string().optional(),
  order: z.number().int().optional(),
});

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();
  const id = params.id;
  if (!id) return badRequest('Missing id');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const parsed = PatchBody.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');

  try {
    await connectDB();
    const update: Record<string, unknown> = {};
    if (parsed.data.name) update.name = parsed.data.name;
    if (parsed.data.slug) update.slug = parsed.data.slug.toLowerCase();
    if (parsed.data.accentColor) update.accentColor = parsed.data.accentColor;
    if (typeof parsed.data.order === 'number') update.order = parsed.data.order;

    const series = await Series.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!series) return notFound('Series not found');
    return ok({ series });
  } catch (err) {
    console.error('series PATCH', err);
    return serverError();
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();
  const id = params.id;
  if (!id) return badRequest('Missing id');
  try {
    await connectDB();
    // Refuse if any variants still belong to this series — caller should
    // reassign or delete those first.
    const variantCount = await Variant.countDocuments({ seriesId: id });
    if (variantCount > 0) {
      return badRequest(`Cannot delete: ${variantCount} variant${variantCount === 1 ? '' : 's'} still belong to this series.`);
    }
    const series = await Series.findByIdAndDelete(id);
    if (!series) return notFound('Series not found');
    return ok({ deleted: true });
  } catch (err) {
    console.error('series DELETE', err);
    return serverError();
  }
};
