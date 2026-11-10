import type { APIRoute } from 'astro';
import { buildSitemap, normalizeSeo, type SitemapEntry } from '../lib/seo';
import { loadPageSeoMap, normalizePath } from '../lib/cms/pageSeo';
import { loadPublishedPosts } from '../lib/cms/blog';
import { loadVariantSeoMap } from '../lib/cms/products';

export const prerender = true;

// Every static page file except admin/api/dynamic routes and this endpoint.
const pageFiles = Object.keys(import.meta.glob('/src/pages/**/*.astro'));

function fileToPath(file: string): string | null {
  const rel = file.replace('/src/pages', '').replace(/\.astro$/, '');
  if (rel.startsWith('/admin') || rel.startsWith('/api') || rel.includes('[')) return null;
  return normalizePath(rel === '/index' ? '/' : rel);
}

export const GET: APIRoute = async () => {
  const [pageSeo, variantSeo, posts] = await Promise.all([
    loadPageSeoMap(),
    loadVariantSeoMap(),
    loadPublishedPosts(),
  ]);

  const entries: SitemapEntry[] = [];
  for (const file of pageFiles) {
    const path = fileToPath(file);
    if (!path) continue;
    const seo = pageSeo[path] ?? variantSeo[path.slice(1)];
    entries.push({ path, noindex: Boolean(seo?.robots.noindex) });
  }
  for (const [path, seo] of Object.entries(pageSeo)) {
    if (seo.robots.noindex) entries.push({ path, noindex: true });
  }
  for (const post of posts) {
    const seo = normalizeSeo(post.seo);
    entries.push({
      path: `/blogs/${post.slug}`,
      lastmod: post.publishedAt.slice(0, 10),
      noindex: seo.robots.noindex,
    });
  }

  return new Response(buildSitemap(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
