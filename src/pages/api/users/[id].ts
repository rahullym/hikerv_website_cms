export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../lib/db';
import { User } from '../../../lib/db/models/User';
import { hashPassword } from '../../../lib/auth/passwords';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, forbidden, notFound, ok, serverError } from '../../../lib/api/respond';

const PatchBody = z.object({
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  disabled: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  if (!hasRole(locals.session, 'admin')) return forbidden();
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
    const update: Record<string, unknown> = {};
    if (parsed.data.role) update.role = parsed.data.role;
    if (typeof parsed.data.disabled === 'boolean') update.disabled = parsed.data.disabled;
    if (parsed.data.password) update.passwordHash = await hashPassword(parsed.data.password);

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
      projection: { passwordHash: 0 },
    }).lean();
    if (!user) return notFound('User not found');
    return ok({ user });
  } catch (err) {
    console.error('users PATCH', err);
    return serverError();
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!hasRole(locals.session, 'admin')) return forbidden();
  const id = params.id;
  if (!id) return badRequest('Missing id');
  // Don't allow deleting yourself — leaves you locked out
  if (locals.session?.sub === id) return badRequest('You cannot delete your own account');
  try {
    await connectDB();
    const user = await User.findByIdAndDelete(id);
    if (!user) return notFound('User not found');
    return ok({ deleted: true });
  } catch (err) {
    console.error('users DELETE', err);
    return serverError();
  }
};
