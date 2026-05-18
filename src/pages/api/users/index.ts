export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../lib/db';
import { User } from '../../../lib/db/models/User';
import { hashPassword } from '../../../lib/auth/passwords';
import { hasRole } from '../../../lib/auth/session';
import { badRequest, created, forbidden, ok, serverError } from '../../../lib/api/respond';

const CreateBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'editor', 'viewer']),
});

export const GET: APIRoute = async ({ locals }) => {
  if (!hasRole(locals.session, 'admin')) return forbidden();
  try {
    await connectDB();
    const users = await User.find({}, { passwordHash: 0 })
      .sort({ createdAt: -1 })
      .lean();
    return ok({ users });
  } catch (err) {
    console.error('users GET', err);
    return serverError();
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!hasRole(locals.session, 'admin')) return forbidden();
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
    const exists = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (exists) return badRequest('A user with that email already exists');

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      role: parsed.data.role,
      disabled: false,
    });
    return created({
      user: { _id: user._id, email: user.email, role: user.role, disabled: user.disabled },
    });
  } catch (err) {
    console.error('users POST', err);
    return serverError();
  }
};
