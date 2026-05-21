export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../lib/db';
import { Faq } from '../../lib/db/models/Faq';
import { hasRole } from '../../lib/auth/session';
import { badRequest, forbidden, ok, serverError } from '../../lib/api/respond';

const Body = z.object({
  sections: z
    .array(
      z.object({
        category: z.string().min(1),
        items: z
          .array(
            z.object({
              q: z.string().min(1),
              a: z.string().min(1),
            })
          )
          .min(0),
      })
    )
    .min(0),
});

export const GET: APIRoute = async ({ locals }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  try {
    await connectDB();
    const doc = await Faq.findOne({ key: 'main' }).lean();
    return ok({ sections: doc?.sections ?? [] });
  } catch (err) {
    console.error('faq GET', err);
    return serverError();
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');

  try {
    await connectDB();
    // Re-stamp order indices so consumers don't need to trust client ordering
    const sections = parsed.data.sections.map((section, sIdx) => ({
      category: section.category,
      order: sIdx,
      items: section.items.map((item, iIdx) => ({
        q: item.q,
        a: item.a,
        order: iIdx,
      })),
    }));

    const updated = await Faq.findOneAndUpdate(
      { key: 'main' },
      { key: 'main', sections },
      { upsert: true, new: true }
    ).lean();
    return ok({ sections: updated.sections });
  } catch (err) {
    console.error('faq PUT', err);
    return serverError();
  }
};
