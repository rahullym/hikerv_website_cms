export const prerender = false;

import type { APIRoute } from 'astro';
import { connectDB } from '../../../lib/db';
import { Subscriber } from '../../../lib/db/models/Subscriber';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, forbidden, notFound, ok, serverError } from '../../../lib/api/respond';

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();
  const id = params.id;
  if (!id) return badRequest('Missing id');
  try {
    await connectDB();
    const sub = await Subscriber.findByIdAndDelete(id);
    if (!sub) return notFound('Subscriber not found');
    return ok({ deleted: true });
  } catch (err) {
    console.error('subscriber DELETE', err);
    return serverError();
  }
};
