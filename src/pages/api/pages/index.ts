export const prerender = false;

import type { APIRoute } from 'astro';
import { connectDB } from '../../../lib/db';
import { SitePage } from '../../../lib/db/models/SitePage';
import { hasRole } from '../../../lib/auth/session';
import { forbidden, ok, serverError } from '../../../lib/api/respond';
import { SITE_PAGE_SEED } from '../../../lib/cms/sitePages';

export const GET: APIRoute = async ({ locals }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  try {
    await connectDB();
    const docs = await SitePage.find().lean();
    const docBySlug = new Map(docs.map((d) => [d.slug, d]));
    // Merge seed + Mongo so a fresh DB still lists every editable page.
    const pages = SITE_PAGE_SEED.map((s) => {
      const d = docBySlug.get(s.slug);
      return {
        slug: s.slug,
        label: s.label,
        title: (d?.title || '').trim() || s.title,
        description: (d?.description || '').trim() || s.description,
        keywords: (d?.keywords || '').trim() || s.keywords,
        ogImage: (d?.ogImage || '').trim() || s.ogImage,
        canonical: (d?.canonical || '').trim() || s.canonical,
        seeded: true,
        overridden: !!d,
        updatedAt: d?.updatedAt,
      };
    });
    return ok({ pages });
  } catch (err) {
    console.error('site-pages GET', err);
    return serverError();
  }
};
