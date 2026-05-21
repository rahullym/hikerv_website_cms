export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { presignUpload } from '../../../lib/s3';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, forbidden, ok, serverError } from '../../../lib/api/respond';

const Body = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

export const POST: APIRoute = async ({ request, locals }) => {
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
    const result = await presignUpload(parsed.data);
    return ok(result);
  } catch (err) {
    console.error('presign', err);
    return serverError((err as Error).message ?? 'Presign failed');
  }
};
