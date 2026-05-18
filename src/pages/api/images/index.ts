export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../lib/db';
import { ImageAsset } from '../../../lib/db/models/ImageAsset';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, created, forbidden, ok, serverError } from '../../../lib/api/respond';

const CreateBody = z.object({
  key: z.string().min(1),
  url: z.string().url(),
  filename: z.string().min(1),
  mime: z.string().min(1),
  size: z.number().int().nonnegative(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  alt: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const GET: APIRoute = async ({ url, locals }) => {
  if (!hasRole(locals.session, 'viewer')) return forbidden();
  try {
    await connectDB();
    const q = url.searchParams.get('q')?.trim();
    const filter = q ? { $text: { $search: q } } : {};
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 60), 200);
    const images = await ImageAsset.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return ok({ images });
  } catch (err) {
    console.error('images GET', err);
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
    const exists = await ImageAsset.findOne({ key: parsed.data.key });
    if (exists) return badRequest('Image with this key already exists');
    const image = await ImageAsset.create({
      ...parsed.data,
      tags: parsed.data.tags ?? [],
      uploadedById: locals.session?.sub,
    });
    return created({ image });
  } catch (err) {
    console.error('images POST', err);
    return serverError();
  }
};
