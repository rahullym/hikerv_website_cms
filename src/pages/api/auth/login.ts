export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { connectDB } from '../../../lib/db';
import { User } from '../../../lib/db/models/User';
import { verifyPassword } from '../../../lib/auth/passwords';
import { signSession, SESSION_COOKIE, sessionCookieAttributes } from '../../../lib/auth/jwt';
import { ensureBootstrapAdmin } from '../../../lib/auth/bootstrap';
import { badRequest, unauthorized, serverError } from '../../../lib/api/respond';

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) return badRequest('Email and password required');

  const { email, password } = parsed.data;

  try {
    await connectDB();
    await ensureBootstrapAdmin();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.disabled) return unauthorized('Invalid credentials');

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return unauthorized('Invalid credentials');

    const token = signSession({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return new Response(
      JSON.stringify({ email: user.email, role: user.role }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `${SESSION_COOKIE}=${token}; ${sessionCookieAttributes()}`,
        },
      }
    );
  } catch (err) {
    console.error('login error', err);
    return serverError();
  }
};
