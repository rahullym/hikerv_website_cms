export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../../lib/db';
import { Variant } from '../../../../lib/db/models/Variant';
import { hasRole } from '../../../../lib/auth/session';
import { badRequest, forbidden, notFound, ok, serverError } from '../../../../lib/api/respond';

const TierSchema = z.object({
  chassis: z.array(z.string()),
  furniture: z.array(z.string()),
  electrical: z.array(z.string()),
  plumbing: z.array(z.string()),
});

// Loose schema — the editor only sends fields the user actually touched. We
// accept any subset and overwrite. Heavier validation lives in Phase 9.
const PatchBody = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  status: z.enum(['draft', 'published']).optional(),
  order: z.number().int().optional(),
  hero: z.object({
    kicker: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    body: z.string().optional(),
    heroImage: z.string().optional(),
    brochureUrl: z.string().optional(),
    quickStats: z.array(z.object({
      value: z.string(),
      label: z.string(),
      accent: z.string().optional(),
    })).optional(),
  }).optional(),
  specIcons: z.array(z.object({
    icon: z.string(),
    value: z.string(),
    caption: z.string(),
  })).optional(),
  specTable: z.object({
    ultra: TierSchema,
    terrain: TierSchema,
    hiker: TierSchema,
  }).optional(),
  premiumLiving: z.object({
    heading: z.string().optional(),
    body: z.string().optional(),
    images: z.array(z.string()).optional(),
    chips: z.array(z.string()).optional(),
  }).optional(),
  floorplans: z.array(z.object({
    title: z.string(),
    desc: z.string(),
    src: z.string(),
  })).optional(),
  cta: z.object({
    kicker: z.string().optional(),
    heading: z.string().optional(),
    body: z.string().optional(),
  }).optional(),
  gallery: z.object({
    exterior: z.array(z.string()).optional(),
    interior: z.array(z.string()).optional(),
  }).optional(),
  showMoodBoard: z.boolean().optional(),
  backLinkHref: z.string().optional(),
  backLinkLabel: z.string().optional(),
});

export const GET: APIRoute = async ({ params, locals }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  const id = params.id;
  if (!id) return badRequest('Missing id');
  try {
    await connectDB();
    const variant = await Variant.findById(id).lean();
    if (!variant) return notFound('Variant not found');
    return ok({ variant });
  } catch (err) {
    console.error('variant GET', err);
    return serverError();
  }
};

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
    const variant = await Variant.findById(id);
    if (!variant) return notFound('Variant not found');
    // Use set() so nested partial updates merge with defaults rather than wipe
    variant.set(parsed.data);
    await variant.save();
    return ok({ variant: variant.toObject() });
  } catch (err) {
    console.error('variant PATCH', err);
    return serverError();
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();
  const id = params.id;
  if (!id) return badRequest('Missing id');
  try {
    await connectDB();
    const deleted = await Variant.findByIdAndDelete(id);
    if (!deleted) return notFound('Variant not found');
    return ok({ deleted: true });
  } catch (err) {
    console.error('variant DELETE', err);
    return serverError();
  }
};
