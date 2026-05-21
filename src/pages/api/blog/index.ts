export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../lib/db';
import { Post } from '../../../lib/db/models/Post';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, created, forbidden, ok, serverError } from '../../../lib/api/respond';

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const CreateBody = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  body: z.string().optional(),
  category: z.string().optional(),
  readTime: z.string().optional(),
  heroImage: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const GET: APIRoute = async ({ locals }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  try {
    await connectDB();
    const posts = await Post.find()
      .sort({ updatedAt: -1 })
      .select('-body') // list view doesn't need full body
      .lean();
    return ok({ posts });
  } catch (err) {
    console.error('blog GET', err);
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
    const data = parsed.data;
    let slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
    // de-dupe slug
    const exists = await Post.findOne({ slug });
    if (exists) {
      let n = 2;
      while (await Post.findOne({ slug: `${slug}-${n}` })) n++;
      slug = `${slug}-${n}`;
    }

    const post = await Post.create({
      slug,
      title: data.title,
      subtitle: data.subtitle ?? '',
      description: data.description ?? '',
      body: data.body ?? '',
      category: data.category ?? '',
      readTime: data.readTime ?? '',
      heroImage: data.heroImage ?? '',
      status: data.status ?? 'draft',
      publishedAt: data.status === 'published' ? new Date() : undefined,
      authorId: locals.session?.sub,
    });

    return created({ post });
  } catch (err) {
    console.error('blog POST', err);
    return serverError();
  }
};
