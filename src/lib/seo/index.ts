/**
 * Shared SEO helpers — used by the admin editor (client), the API (validation),
 * the Layout <head> and the sitemap. Pure functions, no framework imports.
 */

export const SITE_URL = 'https://www.hikervcaravans.com.au';

export const TITLE_RANGE = { min: 50, max: 60 } as const;
export const DESCRIPTION_RANGE = { min: 120, max: 160 } as const;

export type TwitterCard = 'summary_large_image' | 'summary';

export interface SeoRobots {
  noindex: boolean;
  nofollow: boolean;
  noarchive: boolean;
  nosnippet: boolean;
}

export interface SeoMetadata {
  title: string;
  description: string;
  slug: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: TwitterCard;
  robots: SeoRobots;
  /** Raw JSON-LD (string) — validated on save. */
  customSchema: string;
}

export function emptySeo(): SeoMetadata {
  return {
    title: '',
    description: '',
    slug: '',
    canonical: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    robots: { noindex: false, nofollow: false, noarchive: false, nosnippet: false },
    customSchema: '',
  };
}

/** Merge partial/unknown data (e.g. a Mongo doc) onto a full SeoMetadata. */
export function normalizeSeo(input: unknown): SeoMetadata {
  const base = emptySeo();
  if (!input || typeof input !== 'object') return base;
  const i = input as Record<string, any>;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const r = (i.robots ?? {}) as Record<string, unknown>;
  return {
    title: str(i.title),
    description: str(i.description),
    slug: str(i.slug),
    canonical: str(i.canonical),
    ogTitle: str(i.ogTitle),
    ogDescription: str(i.ogDescription),
    ogImage: str(i.ogImage),
    twitterCard: i.twitterCard === 'summary' ? 'summary' : 'summary_large_image',
    robots: {
      noindex: r.noindex === true,
      nofollow: r.nofollow === true,
      noarchive: r.noarchive === true,
      nosnippet: r.nosnippet === true,
    },
    customSchema: str(i.customSchema),
  };
}

export type CounterLevel = 'empty' | 'short' | 'good' | 'long';

/** Level for a character counter given a recommended range. */
export function counterLevel(length: number, range: { min: number; max: number }): CounterLevel {
  if (length === 0) return 'empty';
  if (length < range.min) return 'short';
  if (length > range.max) return 'long';
  return 'good';
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** kebab-case, URL-safe. Empty is allowed (means "use default"). */
export function validateSlug(slug: string): string | null {
  if (slug === '') return null;
  if (!SLUG_RE.test(slug)) {
    return 'Slug must be lowercase kebab-case (a-z, 0-9, single hyphens, no leading/trailing hyphen)';
  }
  return null;
}

/** Empty is allowed. Otherwise must be an absolute http(s) URL. */
export function validateCanonical(url: string): string | null {
  if (url === '') return null;
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return 'Canonical URL must start with http:// or https://';
    return null;
  } catch {
    return 'Canonical URL must be an absolute URL (https://…)';
  }
}

/** Empty is allowed. Otherwise must parse as a JSON object or array. */
export function validateJsonLd(raw: string): string | null {
  if (raw.trim() === '') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return `Invalid JSON: ${(e as Error).message}`;
  }
  if (parsed === null || typeof parsed !== 'object') return 'JSON-LD must be an object or array';
  return null;
}

/** Collect every validation error for a SeoMetadata. */
export function validateSeo(seo: SeoMetadata): string[] {
  return [
    validateSlug(seo.slug),
    validateCanonical(seo.canonical),
    validateJsonLd(seo.customSchema),
  ].filter((e): e is string => Boolean(e));
}

/** Build a `robots` meta content string, e.g. "noindex, nofollow". Default "index, follow". */
export function robotsContent(r: SeoRobots): string {
  const parts: string[] = [];
  parts.push(r.noindex ? 'noindex' : 'index');
  parts.push(r.nofollow ? 'nofollow' : 'follow');
  if (r.noarchive) parts.push('noarchive');
  if (r.nosnippet) parts.push('nosnippet');
  return parts.join(', ');
}

export function isNoindex(seo?: Partial<SeoMetadata> | null): boolean {
  return Boolean(seo?.robots?.noindex);
}

export function absoluteUrl(pathOrUrl: string, site: string = SITE_URL): string {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return site.replace(/\/$/, '') + (pathOrUrl.startsWith('/') ? '' : '/') + pathOrUrl;
}

export interface HeadInput {
  title: string;
  description: string;
  /** Path of the current page, e.g. "/blogs/foo". */
  pathname: string;
  /** Default OG image (path or URL). */
  defaultImage?: string;
  seo?: Partial<SeoMetadata> | null;
}

export interface HeadMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: TwitterCard;
  jsonLd: string[];
}

/** Resolve final <head> values: CMS seo values win, fallback defaults otherwise. */
export function resolveHead(input: HeadInput, site: string = SITE_URL): HeadMeta {
  const seo = normalizeSeo(input.seo);
  const title = seo.title || input.title;
  const description = seo.description || input.description;
  const pathname = input.pathname.replace(/index\.html$/, '') || '/';
  return {
    title,
    description,
    canonical: seo.canonical || absoluteUrl(pathname, site),
    robots: robotsContent(seo.robots),
    ogTitle: seo.ogTitle || title,
    ogDescription: seo.ogDescription || description,
    ogImage: absoluteUrl(seo.ogImage || input.defaultImage || '/assets/hero.png', site),
    twitterCard: seo.twitterCard,
    jsonLd: validateJsonLd(seo.customSchema) === null && seo.customSchema.trim() ? [seo.customSchema.trim()] : [],
  };
}

/** Safely embed JSON in a <script> tag. */
export function escapeJsonForScript(json: string): string {
  return json.replace(/</g, '\\u003c');
}

export interface SitemapEntry {
  path: string;
  lastmod?: string;
  noindex?: boolean;
}

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** Build sitemap.xml; noindex entries (by path) are excluded, duplicates collapsed. */
export function buildSitemap(entries: SitemapEntry[], site: string = SITE_URL): string {
  const excluded = new Set(entries.filter((e) => e.noindex).map((e) => e.path));
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const e of entries) {
    if (excluded.has(e.path) || seen.has(e.path)) continue;
    seen.add(e.path);
    urls.push(
      `  <url><loc>${xmlEscape(absoluteUrl(e.path, site))}</loc>` +
        (e.lastmod ? `<lastmod>${xmlEscape(e.lastmod)}</lastmod>` : '') +
        `</url>`
    );
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}
