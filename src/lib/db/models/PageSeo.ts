import { mongoose } from '../index';
import { SeoSchema } from './seoSchema';
import type { SeoMetadata } from '../../seo';

/** SEO overrides for static site pages (home, /about, /faq, series pages…), keyed by URL path. */
export interface PageSeoDoc {
  _id: mongoose.Types.ObjectId;
  path: string; // e.g. "/about"
  seo: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const PageSeoSchema = new mongoose.Schema<PageSeoDoc>(
  {
    path: { type: String, required: true, unique: true, trim: true },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const PageSeo =
  (mongoose.models.PageSeo as mongoose.Model<PageSeoDoc>) ??
  mongoose.model<PageSeoDoc>('PageSeo', PageSeoSchema);
