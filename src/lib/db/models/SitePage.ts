import { mongoose } from '../index';

export interface SitePageDoc {
  _id: mongoose.Types.ObjectId;
  /** Page identifier — must match the slug used by loadPageSeo() in the page
   *  frontmatter (e.g. 'home', 'about', 'contact', 'drifter', 'rover'). */
  slug: string;
  /** Human-readable label shown in /admin/pages list. */
  label: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonical: string;
  createdAt: Date;
  updatedAt: Date;
}

const SitePageSchema = new mongoose.Schema<SitePageDoc>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    label: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    canonical: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SitePage =
  (mongoose.models.SitePage as mongoose.Model<SitePageDoc>) ??
  mongoose.model<SitePageDoc>('SitePage', SitePageSchema);
