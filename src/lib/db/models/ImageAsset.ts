import { mongoose } from '../index';

export interface ImageAssetDoc {
  _id: mongoose.Types.ObjectId;
  key: string; // S3 object key
  url: string; // public URL (CloudFront)
  filename: string;
  mime: string;
  size: number; // bytes
  width?: number;
  height?: number;
  alt: string;
  tags: string[];
  uploadedById?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ImageAssetSchema = new mongoose.Schema<ImageAssetDoc>(
  {
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, default: 0 },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String, default: '' },
    tags: { type: [String], default: [] },
    uploadedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ImageAssetSchema.index({ filename: 'text', alt: 'text', tags: 'text' });

export const ImageAsset =
  (mongoose.models.ImageAsset as mongoose.Model<ImageAssetDoc>) ??
  mongoose.model<ImageAssetDoc>('ImageAsset', ImageAssetSchema);
