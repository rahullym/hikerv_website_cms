import { mongoose } from '../index';

export interface FaqItem {
  q: string;
  a: string;
  order: number;
}

export interface FaqSection {
  category: string;
  order: number;
  items: FaqItem[];
}

export interface FaqDoc {
  _id: mongoose.Types.ObjectId;
  // singleton document: there's only ever one with key === 'main'
  key: string;
  sections: FaqSection[];
  updatedAt: Date;
  createdAt: Date;
}

const FaqItemSchema = new mongoose.Schema<FaqItem>(
  {
    q: { type: String, required: true },
    a: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const FaqSectionSchema = new mongoose.Schema<FaqSection>(
  {
    category: { type: String, required: true },
    order: { type: Number, default: 0 },
    items: { type: [FaqItemSchema], default: [] },
  },
  { _id: false }
);

const FaqSchema = new mongoose.Schema<FaqDoc>(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    sections: { type: [FaqSectionSchema], default: [] },
  },
  { timestamps: true }
);

export const Faq =
  (mongoose.models.Faq as mongoose.Model<FaqDoc>) ??
  mongoose.model<FaqDoc>('Faq', FaqSchema);
