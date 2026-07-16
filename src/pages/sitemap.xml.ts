import type { APIRoute } from 'astro';
import { loadPublishedPosts } from '../lib/cms/blog';

// Fallback origin if `site` is somehow unset in config (it isn't, but keep the
// endpoint self-contained rather than emitting relative/broken <loc> values).
const FALLBACK_ORIGIN = 'https://hikervcaravans.com.au';

// Enumerate every page file at build time. Vite resolves this glob to the set
// of `.astro` pages under src/pages, so new marketing / product / variant
// pages appear in the sitemap automatically — there is no hand-maintained
// list to keep in sync. Blog posts are the one exception (CMS/DB-driven), and
// are added separately below.
const pageModules = import.meta.glob('./**/*.astro');

/**
 * Map a glob key (e.g. `./grand-rover-196.astro`) to a public URL path, or
 * null if the route should be excluded from the sitemap.
 */
function fileToRoute(key: string): string | null {
  const path = key.replace(/^\.\//, '').replace(/\.astro$/, '');
  if (path.startsWith('admin/') || path.startsWith('api/')) return null; // gated / non-HTML
  if (path.includes('[')) return null; // dynamic routes are enumerated from data
  if (path === '404' || path === '500') return null;
  if (path === 'index') return '/';
  return `/${path}`;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const origin = (site?.href ?? `${FALLBACK_ORIGIN}/`).replace(/\/$/, '');

  const staticRoutes = Object.keys(pageModules)
    .map(fileToRoute)
    .filter((route): route is string => route !== null);

  const posts = await loadPublishedPosts();

  // Dedupe by path. A prerendered blog `.astro` file and a DB post can share a
  // slug; the post wins so we can attach its <lastmod>.
  const entries = new Map<string, { path: string; lastmod?: string }>();
  for (const path of staticRoutes) entries.set(path, { path });
  for (const post of posts) {
    const path = `/blogs/${post.slug}`;
    entries.set(path, { path, lastmod: post.publishedAt });
  }

  const urls = [...entries.values()]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(({ path, lastmod }) => {
      const loc = xmlEscape(`${origin}${path}`);
      const lm = lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : '';
      return `  <url>\n    <loc>${loc}</loc>${lm}\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Cheap to regenerate; let the CDN hold it briefly so crawlers don't hit
      // Mongo on every fetch, while CMS blog changes still surface within the hour.
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
};
