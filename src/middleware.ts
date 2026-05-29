import { defineMiddleware } from 'astro:middleware';
import { readSession } from './lib/auth/session';

// Routes that must be reachable without a session
const OPEN_API_ROUTES = new Set<string>(['/api/auth/login', '/api/subscribe', '/api/contact']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminPage = pathname.startsWith('/admin');
  const isApiRoute = pathname.startsWith('/api');
  if (!isAdminPage && !isApiRoute) return next();

  // Read session for everyone — the GET handlers on dual-mode routes
  // (e.g. /api/subscribe, /api/contact: public POST + admin GET) need it.
  const session = readSession(context);
  context.locals.session = session;

  if (pathname === '/admin/login') return next();

  // For methods that allow anonymous access on these routes (POST submit
  // from a public form), skip the auth gate. Other methods (admin GET/list)
  // still rely on the per-route hasRole() check.
  if (
    isApiRoute &&
    OPEN_API_ROUTES.has(pathname) &&
    (context.request.method === 'POST' || context.request.method === 'OPTIONS')
  ) {
    return next();
  }

  if (!session) {
    if (isApiRoute) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Bounce the browser back to login, preserving where they were headed
    const redirect = encodeURIComponent(pathname + context.url.search);
    return context.redirect(`/admin/login?next=${redirect}`);
  }

  return next();
});
