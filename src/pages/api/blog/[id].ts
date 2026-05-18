export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../lib/db';
import { Post } from '../../../lib/db/models/Post';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, forbidden, notFound, ok, serverError } from '../../../lib/api/respond';

const PatchBody = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  body: z.string().optional(),
  category: z.string().optional(),
  readTime: z.string().optional(),
  heroImage: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const GET: APIRoute = async ({ params, locals }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  const id = params.id;
  if (!id) return badRequest('Missing id');
  try {
    await connectDB();
    const post = await Post.findById(id).lean();
    if (!post) return notFound('Post not found');
    return ok({ post });
  } catch (err) {
    console.error('blog GET id', err);
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
    const existing = await Post.findById(id);
    if (!existing) return notFound('Post not found');

    const updates = parsed.data;
    Object.assign(existing, updates);

    // First-time publish stamps publishedAt
    if (updates.status === 'published' && !existing.publishedAt) {
      existing.publishedAt = new Date();
    }
    await existing.save();
    return ok({ post: existing.toObject() });
  } catch (err) {
    console.error('blog PATCH', err);
    return serverError();
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();
  const id = params.id;
  if (!id) return badRequest('Missing id');
  try {
    await connectDB();
    const deleted = await Post.findByIdAndDelete(id);
    if (!deleted) return notFound('Post not found');
    return ok({ deleted: true });
  } catch (err) {
    console.error('blog DELETE', err);
    return serverError();
  }
};
