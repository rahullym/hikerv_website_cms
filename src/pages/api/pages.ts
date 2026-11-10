export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../lib/db';
import { PageSeo } from '../../lib/db/models/PageSeo';
import { SeoBody } from '../../lib/seo/schema';
import { normalizePath } from '../../lib/cms/pageSeo';
import { hasRole } from '../../lib/auth/session';
import { badRequest, forbidden, ok, serverError } from '../../lib/api/respond';

const PutBody = z.object({
  path: z.string().min(1).regex(/^\/[a-z0-9\-/]*$/i, 'Path must start with / and be URL-safe'),
  seo: SeoBody,
});

export const GET: APIRoute = async ({ locals }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  try {
    await connectDB();
    const pages = await PageSeo.find().sort({ path: 1 }).lean();
    return ok({ pages });
  } catch (err) {
    console.error('pages GET', err);
    return serverError();
  }
};

/** Upsert SEO metadata for a static page, keyed by path. */
export const PUT: APIRoute = async ({ request, locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const parsed = PutBody.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
  try {
    await connectDB();
    const path = normalizePath(parsed.data.path);
    const page = await PageSeo.findOneAndUpdate(
      { path },
      { path, seo: parsed.data.seo },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return ok({ page });
  } catch (err) {
    console.error('pages PUT', err);
    return serverError();
  }
};
