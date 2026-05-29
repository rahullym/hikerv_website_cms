export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../lib/db';
import { Lead } from '../../../lib/db/models/Lead';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, forbidden, notFound, ok, serverError } from '../../../lib/api/respond';

const PatchBody = z.object({
  status: z.enum(['new', 'contacted', 'closed']).optional(),
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
  if (!parsed.success) return badRequest('Invalid status');
  try {
    await connectDB();
    const lead = await Lead.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
    if (!lead) return notFound('Lead not found');
    return ok({ lead });
  } catch (err) {
    console.error('lead PATCH', err);
    return serverError();
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();
  const id = params.id;
  if (!id) return badRequest('Missing id');
  try {
    await connectDB();
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) return notFound('Lead not found');
    return ok({ deleted: true });
  } catch (err) {
    console.error('lead DELETE', err);
    return serverError();
  }
};
