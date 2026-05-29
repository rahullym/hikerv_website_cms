import { mongoose } from '../index';

export interface LeadDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  model?: string;
  size?: string;
  state?: string;
  message?: string;
  source: string;
  status: 'new' | 'contacted' | 'closed';
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new mongoose.Schema<LeadDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    model: { type: String, trim: true },
    size: { type: String, trim: true },
    state: { type: String, trim: true },
    message: { type: String, trim: true },
    source: { type: String, default: 'contact' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ status: 1, createdAt: -1 });

export const Lead =
  (mongoose.models.Lead as mongoose.Model<LeadDoc>) ??
  mongoose.model<LeadDoc>('Lead', LeadSchema);
