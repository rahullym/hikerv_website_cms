export const prerender = false;

import type { APIRoute } from 'astro';
import { hasRole } from '../../lib/auth/session';
import { badRequest, forbidden, ok, serverError } from '../../lib/api/respond';

/**
 * Triggers the configured Vercel Deploy Hook, rebuilding the static site so
 * the latest Mongo content goes live. Requires editor role; admin should set
 * VERCEL_BUILD_HOOK in env to a deploy-hook URL from the Vercel project
 * settings.
 */
export const POST: APIRoute = async ({ locals }) => {
  if (!hasRole(locals.session, 'editor')) return forbidden();

  const hook = import.meta.env.VERCEL_BUILD_HOOK;
  if (!hook) {
    return badRequest('VERCEL_BUILD_HOOK is not configured.');
  }
  try {
    const res = await fetch(hook, { method: 'POST' });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return serverError(`Vercel hook returned ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json().catch(() => ({}));
    return ok({ triggered: true, vercel: data });
  } catch (err) {
    console.error('publish', err);
    return serverError((err as Error).message ?? 'Hook call failed');
  }
};
