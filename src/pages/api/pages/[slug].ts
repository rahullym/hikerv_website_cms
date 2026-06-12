export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../lib/db';
import { SitePage } from '../../../lib/db/models/SitePage';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, forbidden, notFound, ok, serverError } from '../../../lib/api/respond';
import { SITE_PAGE_SEED } from '../../../lib/cms/sitePages';

const PatchBody = z.object({
  label: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  ogImage: z.string().optional(),
  canonical: z.string().optional(),
});

export const GET: APIRoute = async ({ params, locals }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  const slug = params.slug;
  if (!slug) return badRequest('Missing slug');
  const seed = SITE_PAGE_SEED.find((p) => p.slug === slug);
  if (!seed) return notFound('Unknown page');
  try {
    await connectDB();
    const doc = await SitePage.findOne({ slug }).lean();
    return ok({
      page: {
        slug,
        label: seed.label,
        // Each field: Mongo override if non-empty, else seed default.
        title: (doc?.title || '').trim() || seed.title,
        description: (doc?.description || '').trim() || seed.description,
        keywords: (doc?.keywords || '').trim() || seed.keywords,
        ogImage: (doc?.ogImage || '').trim() || seed.ogImage,
        canonical: (doc?.canonical || '').trim() || seed.canonical,
        // Also surface the raw seed so the editor can show "default" hints.
        seed: { ...seed },
      },
    });
  } catch (err) {
    console.error('site-page GET', err);
    return serverError();
  }
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();
  const slug = params.slug;
  if (!slug) return badRequest('Missing slug');
  const seed = SITE_PAGE_SEED.find((p) => p.slug === slug);
  if (!seed) return notFound('Unknown page');
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
    const doc = await SitePage.findOneAndUpdate(
      { slug },
      { $set: { ...parsed.data, slug, label: parsed.data.label ?? seed.label } },
      { upsert: true, new: true }
    ).lean();
    return ok({ page: doc });
  } catch (err) {
    console.error('site-page PATCH', err);
    return serverError();
  }
};
