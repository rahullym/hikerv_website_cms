import { BLOG_SEED, type SeedPost } from './blogSeed';

export interface PublicPostSeo {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

export interface PublicPost {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  body: string;
  category: string;
  readTime: string;
  heroImage: string;
  publishedAt: string; // ISO
  seo: PublicPostSeo;
}

function seedToPublic(s: SeedPost): PublicPost {
  return {
    slug: s.slug,
    title: s.title,
    subtitle: s.subtitle,
    description: s.description,
    body: s.body,
    category: s.category,
    readTime: s.readTime,
    heroImage: s.heroImage,
    publishedAt: s.publishedAt,
    seo: {},
  };
}

const seedPublished = BLOG_SEED.filter((p) => p.status === 'published').map(seedToPublic);

export async function loadPublishedPosts(): Promise<PublicPost[]> {
  if (!import.meta.env.MONGODB_URI) return seedPublished;
  try {
    const { connectDB } = await import('../db');
    const { Post } = await import('../db/models/Post');
    await connectDB();
    const docs = await Post.find({ status: 'published' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();
    if (!docs.length) return seedPublished;
    return docs.map((d) => ({
      slug: d.slug,
      title: d.title,
      subtitle: d.subtitle ?? '',
      description: d.description ?? '',
      body: d.body ?? '',
      category: d.category ?? '',
      readTime: d.readTime ?? '',
      heroImage: d.heroImage ?? '',
      publishedAt: (d.publishedAt ?? d.createdAt).toISOString(),
      seo: d.seo ?? {},
    }));
  } catch (err) {
    console.warn('[blog] Mongo unavailable, using seed:', (err as Error).message);
    return seedPublished;
  }
}

export async function loadPostBySlug(slug: string): Promise<PublicPost | null> {
  const posts = await loadPublishedPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}
