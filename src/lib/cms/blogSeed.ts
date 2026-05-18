/**
 * Hardcoded fallback / seed for blog posts. Used by:
 *  - `loadPublishedPosts()` / `loadPostBySlug()` when Mongo is unreachable
 *  - `scripts/seed.ts` to populate Mongo on first run
 *
 * The 3 entries below are the existing stubs from src/pages/blogs.astro
 * with placeholder `body` HTML so the dynamic /blogs/[slug] route has
 * something to render.
 */

export interface SeedPost {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  body: string;
  category: string;
  readTime: string;
  heroImage: string;
  status: 'draft' | 'published';
  publishedAt: string; // ISO date
}

const STUB_BODY = `
  <p>Coming soon. The Hike RV team is working on this article.</p>
  <p>In the meantime, browse our <a href="/#collection">caravan range</a> or
  <a href="/contact">contact our advisors</a> with questions about your
  next build.</p>
`.trim();

export const BLOG_SEED: SeedPost[] = [
  {
    slug: 'off-road-vs-semi-off-road',
    title: 'Off-Road vs Semi Off-Road Caravans',
    subtitle: 'Which One is Right for You?',
    description: 'Australia offers diverse landscapes. Choosing between extreme terrain and light gravel touring is your first big decision.',
    body: STUB_BODY,
    category: 'Comparison Guide',
    readTime: '8 Min Read',
    heroImage: '/blogs/off-road-vs-semi.png',
    status: 'published',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    slug: 'ultimate-guide-australia',
    title: 'The Ultimate Guide to Caravan Travel',
    subtitle: 'Exploring Australia',
    description: 'From the East Coast to the Red Centre, discover the essentials of route planning, gear, and safe travel.',
    body: STUB_BODY,
    category: 'Ultimate Guide',
    readTime: '12 Min Read',
    heroImage: '/blogs/ultimate-guide-australia.png',
    status: 'published',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    slug: 'rv-maintenance',
    title: 'The Ultimate Guide to RV Maintenance',
    subtitle: 'Maintaining your Investment',
    description: 'Protect your freedom and adventure by following our expert checklist for chassis, electrical, and plumbing care.',
    body: STUB_BODY,
    category: 'Care & Support',
    readTime: '15 Min Read',
    heroImage: '/blogs/rv-maintenance.png',
    status: 'published',
    publishedAt: '2026-01-01T00:00:00.000Z',
  },
];
