import { normalizeSeo, type SeoMetadata } from '../seo';

let cache: Promise<Record<string, SeoMetadata>> | null = null;

/** Normalise a URL path: leading slash, no trailing slash (except root). */
export function normalizePath(p: string): string {
  let s = p.replace(/index\.html$/, '');
  if (!s.startsWith('/')) s = '/' + s;
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return s;
}

/** All CMS page-level SEO overrides, keyed by path. Loaded once per build. */
export function loadPageSeoMap(): Promise<Record<string, SeoMetadata>> {
  if (cache) return cache;
  cache = (async () => {
    const map: Record<string, SeoMetadata> = {};
    if (!import.meta.env.MONGODB_URI) return map;
    try {
      const { connectDB } = await import('../db');
      const { PageSeo } = await import('../db/models/PageSeo');
      await connectDB();
      const docs = await PageSeo.find({}).lean();
      for (const d of docs) map[normalizePath(d.path)] = normalizeSeo(d.seo);
    } catch (err) {
      console.warn('[pageSeo] Mongo unavailable:', (err as Error).message);
    }
    return map;
  })();
  return cache;
}

export async function loadPageSeo(path: string): Promise<SeoMetadata | null> {
  const map = await loadPageSeoMap();
  return map[normalizePath(path)] ?? null;
}
