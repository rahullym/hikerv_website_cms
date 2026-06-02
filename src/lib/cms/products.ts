import { SERIES_SEED, VARIANT_SEED, type SeriesSeed, type VariantSeed } from './productSeed';

export interface SeriesPublic extends SeriesSeed {}

// Public-facing shape: identical to VariantSeed but without the seriesSlug
// helper (callers get series info separately if they need it).
export type VariantPublic = Omit<VariantSeed, 'seriesSlug'> & { seriesSlug: string };

function withFallback(variant: VariantSeed): VariantPublic {
  return variant;
}

export async function loadVariantBySlug(slug: string): Promise<VariantPublic | null> {
  if (import.meta.env.MONGODB_URI) {
    try {
      const { connectDB } = await import('../db');
      const { Variant } = await import('../db/models/Variant');
      const { Series } = await import('../db/models/Series');
      await connectDB();
      const doc = await Variant.findOne({ slug, status: 'published' }).lean();
      if (doc) {
        const series = await Series.findById(doc.seriesId).lean();
        return {
          slug: doc.slug,
          name: doc.name,
          status: doc.status,
          order: doc.order,
          hero: doc.hero,
          specIcons: doc.specIcons,
          specTable: doc.specTable,
          premiumLiving: doc.premiumLiving,
          floorplans: doc.floorplans,
          cta: doc.cta,
          gallery: doc.gallery,
          showMoodBoard: doc.showMoodBoard ?? true,
          backLinkHref: doc.backLinkHref ?? '',
          backLinkLabel: doc.backLinkLabel ?? '',
          seriesSlug: series?.slug ?? '',
        };
      }
    } catch (err) {
      console.warn('[products] Mongo unavailable, falling back to seed:', (err as Error).message);
    }
  }
  const seed = VARIANT_SEED.find((v) => v.slug === slug);
  return seed ? withFallback(seed) : null;
}

export async function listSeries(): Promise<SeriesPublic[]> {
  return SERIES_SEED;
}
