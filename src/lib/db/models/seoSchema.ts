import { mongoose } from '../index';
import type { SeoMetadata } from '../../seo';

/** Embedded `seo` sub-document shared by Post, Variant and Series. */
export const SeoSchema = new mongoose.Schema<SeoMetadata>(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    slug: { type: String, default: '' },
    canonical: { type: String, default: '' },
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    twitterCard: { type: String, enum: ['summary_large_image', 'summary'], default: 'summary_large_image' },
    robots: {
      noindex: { type: Boolean, default: false },
      nofollow: { type: Boolean, default: false },
      noarchive: { type: Boolean, default: false },
      nosnippet: { type: Boolean, default: false },
    },
    customSchema: { type: String, default: '' },
  },
  { _id: false }
);
