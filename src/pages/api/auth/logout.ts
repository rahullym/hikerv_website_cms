export const prerender = false;

import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '../../../lib/auth/jwt';

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
};
