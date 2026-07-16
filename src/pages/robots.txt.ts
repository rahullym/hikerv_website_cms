import type { APIRoute } from 'astro';

const FALLBACK_ORIGIN = 'https://hikervcaravans.com.au';

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.href ?? `${FALLBACK_ORIGIN}/`).replace(/\/$/, '');

  const body = [
    'User-agent: *',
    'Allow: /',
    // Admin UI (auth-gated) and JSON API — nothing crawlable or indexable.
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
};
