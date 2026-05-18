export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../lib/db';
import { ImageAsset } from '../../../lib/db/models/ImageAsset';
import { deleteObject } from '../../../lib/s3';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, forbidden, notFound, ok, serverError } from '../../../lib/api/respond';

const PatchBody = z.object({
  alt: z.string().optional(),
  tags: z.array(z.string()).optional(),
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
  if (!parsed.success) return badRequest('Invalid input');
  try {
    await connectDB();
    const image = await ImageAsset.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
    if (!image) return notFound('Image not found');
    return ok({ image });
  } catch (err) {
    console.error('images PATCH', err);
    return serverError();
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();
  const id = params.id;
  if (!id) return badRequest('Missing id');
  try {
    await connectDB();
    const image = await ImageAsset.findByIdAndDelete(id);
    if (!image) return notFound('Image not found');
    // Best-effort S3 cleanup; don't fail the API if S3 delete fails
    try {
      await deleteObject(image.key);
    } catch (s3err) {
      console.warn('S3 delete failed for', image.key, (s3err as Error).message);
    }
    return ok({ deleted: true });
  } catch (err) {
    console.error('images DELETE', err);
    return serverError();
  }
};
