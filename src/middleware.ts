import { defineMiddleware } from 'astro:middleware';
import { readSession } from './lib/auth/session';

// Routes that must be reachable without a session
const OPEN_API_ROUTES = new Set<string>(['/api/auth/login']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminPage = pathname.startsWith('/admin');
  const isApiRoute = pathname.startsWith('/api');
  if (!isAdminPage && !isApiRoute) return next();

  // /admin/login is a page (no /api prefix) that obviously can't require a session
  if (pathname === '/admin/login') return next();
  if (isApiRoute && OPEN_API_ROUTES.has(pathname)) return next();

  const session = readSession(context);
  context.locals.session = session;

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
