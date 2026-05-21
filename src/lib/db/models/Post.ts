import { mongoose } from '../index';

export type PostStatus = 'draft' | 'published';

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
  status: PostStatus;
  publishedAt?: Date;
  authorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

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
