// CMS SEO management tests. Run via `npm test` (tsx loader handles the .ts imports;
// build-output checks need `astro build` first, which `npm test` does).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  counterLevel, TITLE_RANGE, DESCRIPTION_RANGE, validateSlug, validateCanonical, validateJsonLd,
  validateSeo, robotsContent, resolveHead, buildSitemap, normalizeSeo, emptySeo, escapeJsonForScript,
} from '../src/lib/seo/index.ts';
import { SeoBody } from '../src/lib/seo/schema.ts';

const read = (p) => fs.readFileSync(p, 'utf8');

test('title counter: flags short / good (50-60) / long', () => {
  assert.equal(counterLevel(0, TITLE_RANGE), 'empty');
  assert.equal(counterLevel(49, TITLE_RANGE), 'short');
  assert.equal(counterLevel(50, TITLE_RANGE), 'good');
  assert.equal(counterLevel(60, TITLE_RANGE), 'good');
  assert.equal(counterLevel(61, TITLE_RANGE), 'long');
});

test('description counter: good only within 120-160', () => {
  assert.equal(counterLevel(119, DESCRIPTION_RANGE), 'short');
  assert.equal(counterLevel(120, DESCRIPTION_RANGE), 'good');
  assert.equal(counterLevel(160, DESCRIPTION_RANGE), 'good');
  assert.equal(counterLevel(161, DESCRIPTION_RANGE), 'long');
});

test('slug must be kebab-case and URL-safe', () => {
  for (const ok of ['', 'my-post', 'a1-b2-c3', 'x']) assert.equal(validateSlug(ok), null, ok);
  for (const bad of ['My-Post', 'my post', 'my_post', '-a', 'a-', 'a--b', 'a/b', 'é']) {
    assert.ok(validateSlug(bad), bad);
  }
});

test('canonical must be an absolute http(s) URL (or empty)', () => {
  assert.equal(validateCanonical(''), null);
  assert.equal(validateCanonical('https://example.com/x'), null);
  assert.ok(validateCanonical('/relative'));
  assert.ok(validateCanonical('javascript:alert(1)'));
});

test('JSON-LD validation catches syntax errors', () => {
  assert.equal(validateJsonLd(''), null);
  assert.equal(validateJsonLd('{"@context":"https://schema.org","@type":"Article"}'), null);
  assert.match(validateJsonLd('{"@type": '), /Invalid JSON/);
  assert.ok(validateJsonLd('"just a string"'));
  assert.equal(validateSeo({ ...emptySeo(), customSchema: '{bad' }).length, 1);
});

test('API schema accepts valid SEO and rejects invalid slug / JSON-LD / twitter card', () => {
  assert.ok(SeoBody.safeParse({ title: 't', slug: 'good-slug', twitterCard: 'summary', robots: { noindex: true } }).success);
  assert.ok(!SeoBody.safeParse({ slug: 'Bad Slug' }).success);
  assert.ok(!SeoBody.safeParse({ customSchema: '{nope' }).success);
  assert.ok(!SeoBody.safeParse({ twitterCard: 'player' }).success);
  assert.ok(!SeoBody.safeParse({ canonical: 'nope' }).success);
});

test('robots directives map to meta content', () => {
  assert.equal(robotsContent(emptySeo().robots), 'index, follow');
  assert.equal(robotsContent({ noindex: true, nofollow: false, noarchive: false, nosnippet: false }), 'noindex, follow');
  assert.equal(
    robotsContent({ noindex: true, nofollow: true, noarchive: true, nosnippet: true }),
    'noindex, nofollow, noarchive, nosnippet'
  );
});

test('resolveHead: CMS values override defaults and populate head fields', () => {
  const h = resolveHead({
    title: 'Default', description: 'Default desc', pathname: '/blogs/x',
    seo: {
      title: 'CMS title', description: 'CMS desc', canonical: 'https://example.com/canon',
      ogTitle: 'OG t', ogDescription: 'OG d', ogImage: '/img/share.jpg', twitterCard: 'summary',
      robots: { noindex: true, nofollow: false, noarchive: false, nosnippet: false },
      customSchema: '{"@type":"Article"}',
    },
  });
  assert.equal(h.title, 'CMS title');
  assert.equal(h.description, 'CMS desc');
  assert.equal(h.canonical, 'https://example.com/canon');
  assert.equal(h.ogTitle, 'OG t');
  assert.equal(h.ogDescription, 'OG d');
  assert.equal(h.ogImage, 'https://www.hikervcaravans.com.au/img/share.jpg');
  assert.equal(h.twitterCard, 'summary');
  assert.match(h.robots, /^noindex/);
  assert.deepEqual(h.jsonLd, ['{"@type":"Article"}']);
});

test('resolveHead: falls back to defaults and self-canonical when no CMS data', () => {
  const h = resolveHead({ title: 'T', description: 'D', pathname: '/about', seo: null });
  assert.equal(h.title, 'T');
  assert.equal(h.ogTitle, 'T');
  assert.equal(h.canonical, 'https://www.hikervcaravans.com.au/about');
  assert.equal(h.robots, 'index, follow');
  assert.equal(h.twitterCard, 'summary_large_image');
  assert.deepEqual(h.jsonLd, []);
  assert.equal(resolveHead({ title: 'T', description: 'D', pathname: '/' }).canonical, 'https://www.hikervcaravans.com.au/');
});

test('resolveHead ignores invalid JSON-LD; script embedding escapes "<"', () => {
  assert.deepEqual(resolveHead({ title: 'T', description: 'D', pathname: '/', seo: { customSchema: '{bad' } }).jsonLd, []);
  assert.ok(!escapeJsonForScript('{"a":"</script>"}').includes('</script>'));
});

test('normalizeSeo fills defaults from partial/legacy docs', () => {
  assert.deepEqual(normalizeSeo(undefined), emptySeo());
  assert.equal(normalizeSeo({ robots: { noindex: true } }).robots.noindex, true);
});

test('sitemap excludes noindex URLs, de-duplicates, includes the rest', () => {
  const xml = buildSitemap([
    { path: '/' }, { path: '/about' }, { path: '/about' },
    { path: '/blogs/hidden', noindex: true }, { path: '/blogs/shown', lastmod: '2026-01-02' },
    { path: '/dup', noindex: true }, { path: '/dup' },
  ]);
  assert.match(xml, /<loc>https:\/\/www\.hikervcaravans\.com\.au\/<\/loc>/);
  assert.equal((xml.match(/\/about</g) || []).length, 1);
  assert.match(xml, /blogs\/shown<\/loc><lastmod>2026-01-02/);
  assert.doesNotMatch(xml, /hidden/);
  assert.doesNotMatch(xml, /\/dup/);
});

// ---- Source-level checks for CMS wiring ----
test('media library: alt text is required on create, editable via PATCH, editable in UI', () => {
  const create = read('src/pages/api/images/index.ts');
  assert.match(create, /alt: z\.string\(\)\.trim\(\)\.min\(1/);
  assert.match(read('src/pages/api/images/[id].ts'), /alt: z\.string\(\)/);
  const ui = read('src/pages/admin/images.astro');
  assert.match(ui, /class="alt-input"/);
  assert.match(ui, /method: 'PATCH'/);
  assert.match(ui, /alt,\s*\n\s*width/);
});

test('SEO fields are in Post, Variant, Series and PageSeo models and exposed via APIs', () => {
  for (const m of ['Post', 'Variant', 'Series', 'PageSeo']) assert.match(read(`src/lib/db/models/${m}.ts`), /seo/);
  for (const f of ['src/pages/api/blog/[id].ts', 'src/pages/api/blog/index.ts', 'src/pages/api/products/variants/[id].ts', 'src/pages/api/pages.ts'])
    assert.match(read(f), /SeoBody/);
});

test('SEO editor component is on blog, product and page editors', () => {
  for (const f of ['src/pages/admin/blog/[id].astro', 'src/pages/admin/products/[id].astro', 'src/pages/admin/pages.astro'])
    assert.match(read(f), /<SeoFields/);
  const c = read('src/components/admin/SeoFields.astro');
  for (const id of ['seo-title', 'seo-description', 'seo-slug', 'seo-canonical', 'seo-ogTitle', 'seo-ogDescription', 'seo-ogImage', 'seo-twitterCard', 'seo-robots-noindex', 'seo-robots-nofollow', 'seo-robots-noarchive', 'seo-robots-nosnippet', 'seo-customSchema', 'seo-og-preview'])
    assert.ok(c.includes(`id="${id}"`), id);
  assert.match(c, /summary_large_image/);
});

// ---- Build output (requires `astro build`) ----
const out = path.resolve('.vercel/output/static');
test('built <head> has canonical, robots, og:* and twitter:* tags', { skip: !fs.existsSync(out) }, () => {
  const html = read(path.join(out, 'index.html'));
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.hikervcaravans\.com\.au\/">/);
  assert.match(html, /<meta name="robots" content="index, follow">/);
  for (const p of ['og:title', 'og:description', 'og:image', 'og:url'])
    assert.match(html, new RegExp(`<meta property="${p}" content="[^"]+"`), p);
  for (const n of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'])
    assert.match(html, new RegExp(`<meta name="${n}" content="[^"]+"`), n);
  assert.match(html, /og:image" content="https:\/\//);
});

test('built sitemap.xml lists public pages and omits admin/api', { skip: !fs.existsSync(out) }, () => {
  const xml = read(path.join(out, 'sitemap.xml'));
  assert.match(xml, /<urlset/);
  assert.match(xml, /hikervcaravans\.com\.au\/<\/loc>/);
  assert.match(xml, /\/grand-rover-196<\/loc>/);
  assert.match(xml, /\/blogs\/[a-z0-9-]+<\/loc>/);
  assert.doesNotMatch(xml, /\/admin|\/api\//);
});
