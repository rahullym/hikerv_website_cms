import { mongoose } from '../index';

export interface SpecIcon {
  /** Icon key (maps to a preset SVG in the template) — chassis | inverter | lounge | fridge | frame | suspension | washer | battery | solar | …other */
  icon: string;
  value: string; // e.g. "3000W"
  caption: string; // e.g. "Inverter"
}

export interface SpecTableTier {
  chassis: string[];
  furniture: string[];
  electrical: string[];
  plumbing: string[];
}

export interface Floorplan {
  title: string;
  desc: string;
  src: string; // image URL
}

export interface QuickStat {
  value: string;
  label: string;
  accent?: string; // optional inline accent string (e.g. "FT")
}

export interface Hero {
  kicker?: string; // small red label above title
  title: string; // h1
  subtitle?: string; // h2
  body?: string;
  heroImage: string; // right-side image URL
  brochureUrl?: string;
  quickStats: QuickStat[];
}

export interface PremiumLiving {
  heading?: string;
  body?: string;
  images: string[]; // 3 image URLs
  chips: string[];
}

export interface CtaBlock {
  kicker?: string;
  heading?: string;
  body?: string;
}

export interface VariantDoc {
  _id: mongoose.Types.ObjectId;
  seriesId: mongoose.Types.ObjectId;
  slug: string; // matches Astro page filename, e.g. "grand-rover-196"
  name: string; // display name, e.g. "Grand Rover 19.6"
  hero: Hero;
  specIcons: SpecIcon[];
  specTable: {
    ultra: SpecTableTier;
    terrain: SpecTableTier;
    hiker: SpecTableTier;
  };
  premiumLiving: PremiumLiving;
  floorplans: Floorplan[];
  cta: CtaBlock;
  gallery: {
    exterior: string[];
    interior: string[];
  };
  showMoodBoard: boolean;
  /** Override the "← Back to X" link target. Defaults to /{seriesSlug}. */
  backLinkHref: string;
  /** Override the back link label. Defaults to "Series". */
  backLinkLabel: string;
  order: number;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const SpecIconSchema = new mongoose.Schema<SpecIcon>(
  { icon: String, value: String, caption: String },
  { _id: false }
);

const TierSchema = new mongoose.Schema<SpecTableTier>(
  {
    chassis: { type: [String], default: [] },
    furniture: { type: [String], default: [] },
    electrical: { type: [String], default: [] },
    plumbing: { type: [String], default: [] },
  },
  { _id: false }
);

const FloorplanSchema = new mongoose.Schema<Floorplan>(
  { title: String, desc: String, src: String },
  { _id: false }
);

const QuickStatSchema = new mongoose.Schema<QuickStat>(
  { value: String, label: String, accent: String },
  { _id: false }
);

const HeroSchema = new mongoose.Schema<Hero>(
  {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    body: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    brochureUrl: { type: String, default: '' },
    quickStats: { type: [QuickStatSchema], default: [] },
  },
  { _id: false }
);

const PremiumLivingSchema = new mongoose.Schema<PremiumLiving>(
  {
    heading: { type: String, default: '' },
    body: { type: String, default: '' },
    images: { type: [String], default: [] },
    chips: { type: [String], default: [] },
  },
  { _id: false }
);

const CtaSchema = new mongoose.Schema<CtaBlock>(
  {
    kicker: { type: String, default: '' },
    heading: { type: String, default: '' },
    body: { type: String, default: '' },
  },
  { _id: false }
);

const VariantSchema = new mongoose.Schema<VariantDoc>(
  {
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    hero: { type: HeroSchema, default: () => ({ title: '', quickStats: [] }) },
    specIcons: { type: [SpecIconSchema], default: [] },
    specTable: {
      ultra: { type: TierSchema, default: () => ({ chassis: [], furniture: [], electrical: [], plumbing: [] }) },
      terrain: { type: TierSchema, default: () => ({ chassis: [], furniture: [], electrical: [], plumbing: [] }) },
      hiker: { type: TierSchema, default: () => ({ chassis: [], furniture: [], electrical: [], plumbing: [] }) },
    },
    premiumLiving: { type: PremiumLivingSchema, default: () => ({ images: [], chips: [] }) },
    floorplans: { type: [FloorplanSchema], default: [] },
    cta: { type: CtaSchema, default: () => ({}) },
    gallery: {
      exterior: { type: [String], default: [] },
      interior: { type: [String], default: [] },
    },
    showMoodBoard: { type: Boolean, default: true },
    backLinkHref: { type: String, default: '' },
    backLinkLabel: { type: String, default: '' },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

export const Variant =
  (mongoose.models.Variant as mongoose.Model<VariantDoc>) ??
  mongoose.model<VariantDoc>('Variant', VariantSchema);
