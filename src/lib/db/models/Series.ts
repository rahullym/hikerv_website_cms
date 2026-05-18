import { mongoose } from '../index';

export interface SeriesDoc {
  _id: mongoose.Types.ObjectId;
  slug: string;
  name: string;
  accentColor: string; // hex, e.g. #E50000
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SeriesSchema = new mongoose.Schema<SeriesDoc>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    accentColor: { type: String, default: '#E50000' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Series =
  (mongoose.models.Series as mongoose.Model<SeriesDoc>) ??
  mongoose.model<SeriesDoc>('Series', SeriesSchema);
