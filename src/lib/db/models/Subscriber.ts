import { mongoose } from '../index';

export interface SubscriberDoc {
  _id: mongoose.Types.ObjectId;
  email: string;
  source: 'newsletter' | 'contact';
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new mongoose.Schema<SubscriberDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, enum: ['newsletter', 'contact'], default: 'newsletter' },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export const Subscriber =
  (mongoose.models.Subscriber as mongoose.Model<SubscriberDoc>) ??
  mongoose.model<SubscriberDoc>('Subscriber', SubscriberSchema);
