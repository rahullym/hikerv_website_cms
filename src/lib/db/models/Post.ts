import { mongoose } from '../index';

export type PostStatus = 'draft' | 'published';

export interface PostSeo {
  /** Override the <title> tag. Falls back to "{post.title} | Hike RV Caravans". */
  title?: string;
  /** Meta description. Falls back to post.description. */
  description?: string;
  /** Meta keywords (comma-separated). */
  keywords?: string;
  /** Open Graph + Twitter card image URL. Falls back to post.heroImage. */
  ogImage?: string;
  /** Canonical URL. Falls back to https://hikervcaravans.com.au/blogs/<slug>. */
  canonical?: string;
}

export interface PostDoc {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  body: string; // HTML
  category: string;
  readTime: string; // e.g. "8 Min Read"
  heroImage: string; // public URL (CloudFront or /local path)
  seo: PostSeo;
  status: PostStatus;
  publishedAt?: Date;
  authorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PostSeoSchema = new mongoose.Schema<PostSeo>(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    canonical: { type: String, default: '' },
  },
  { _id: false }
);

const PostSchema = new mongoose.Schema<PostDoc>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    body: { type: String, default: '' },
    category: { type: String, default: '' },
    readTime: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    seo: { type: PostSeoSchema, default: () => ({}) },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PostSchema.index({ status: 1, publishedAt: -1 });

export const Post =
  (mongoose.models.Post as mongoose.Model<PostDoc>) ??
  mongoose.model<PostDoc>('Post', PostSchema);
