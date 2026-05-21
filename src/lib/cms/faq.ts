import type { FaqSection } from '../db/models/Faq';
import { FAQ_SEED } from './faqSeed';

/**
 * Load FAQ sections for the public page.
 *
 * - Builds (SSG) and SSR pages both call this.
 * - Tries Mongo first. On any failure (no env var, network, empty doc) we
 *   fall back to the seed array so the build never breaks.
 */
export async function loadFaqSections(): Promise<FaqSection[]> {
  if (!import.meta.env.MONGODB_URI) return FAQ_SEED;
  try {
    const { connectDB } = await import('../db');
    const { Faq } = await import('../db/models/Faq');
    await connectDB();
    const doc = await Faq.findOne({ key: 'main' }).lean();
    if (!doc || !doc.sections?.length) return FAQ_SEED;
    return doc.sections;
  } catch (err) {
    console.warn('[faq] Mongo unavailable, using seed data:', (err as Error).message);
    return FAQ_SEED;
  }
}
