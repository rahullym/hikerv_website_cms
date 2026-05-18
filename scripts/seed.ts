/**
 * One-off seed script. Run with:
 *   npx tsx scripts/seed.ts
 *
 * Reads MONGODB_URI / BOOTSTRAP_ADMIN_* from the local .env file and copies
 * the hardcoded fallback data (currently just FAQ) into Mongo. Idempotent —
 * safe to re-run; only inserts if the target collection is empty.
 *
 * As more CMS-managed content types come online (blog, products, mood
 * boards), extend the `seeders` array below.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { FAQ_SEED } from '../src/lib/cms/faqSeed';
import { BLOG_SEED } from '../src/lib/cms/blogSeed';
import { SERIES_SEED, VARIANT_SEED } from '../src/lib/cms/productSeed';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it to .env (see .env.example).');
  process.exit(1);
}

async function seedFaq() {
  const Faq = mongoose.model(
    'Faq',
    new mongoose.Schema(
      {
        key: { type: String, unique: true },
        sections: { type: Array, default: [] },
      },
      { timestamps: true, strict: false }
    )
  );
  const existing = await Faq.findOne({ key: 'main' });
  if (existing && existing.sections?.length) {
    console.log('  · FAQ already populated, skipping.');
    return;
  }
  await Faq.findOneAndUpdate(
    { key: 'main' },
    { key: 'main', sections: FAQ_SEED },
    { upsert: true, new: true }
  );
  console.log(`  · Seeded FAQ (${FAQ_SEED.length} sections).`);
}

async function seedAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('  · No BOOTSTRAP_ADMIN_EMAIL/PASSWORD set, skipping admin seed.');
    return;
  }
  const User = mongoose.model(
    'User',
    new mongoose.Schema(
      {
        email: { type: String, unique: true, lowercase: true },
        passwordHash: String,
        role: { type: String, default: 'admin' },
        disabled: { type: Boolean, default: false },
      },
      { timestamps: true, strict: false }
    )
  );
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`  · Admin user ${email} already exists, skipping.`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role: 'admin',
    disabled: false,
  });
  console.log(`  · Seeded admin user ${email}.`);
}

async function seedBlog() {
  const Post = mongoose.model(
    'Post',
    new mongoose.Schema(
      {
        slug: { type: String, unique: true, lowercase: true },
        title: String,
        subtitle: String,
        description: String,
        body: String,
        category: String,
        readTime: String,
        heroImage: String,
        status: { type: String, default: 'draft' },
        publishedAt: Date,
      },
      { timestamps: true, strict: false }
    )
  );

  let inserted = 0;
  let skipped = 0;
  for (const post of BLOG_SEED) {
    const existing = await Post.findOne({ slug: post.slug });
    if (existing) {
      skipped++;
      continue;
    }
    await Post.create({
      ...post,
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
    });
    inserted++;
  }
  console.log(`  · Blog: inserted ${inserted}, skipped ${skipped} (already present).`);
}

async function seedProducts() {
  const Series = mongoose.model(
    'Series',
    new mongoose.Schema(
      {
        slug: { type: String, unique: true, lowercase: true },
        name: String,
        accentColor: String,
        order: Number,
      },
      { timestamps: true, strict: false }
    )
  );
  const Variant = mongoose.model(
    'Variant',
    new mongoose.Schema(
      {
        seriesId: mongoose.Schema.Types.ObjectId,
        slug: { type: String, unique: true, lowercase: true },
        name: String,
        hero: Object,
        specIcons: Array,
        specTable: Object,
        premiumLiving: Object,
        floorplans: Array,
        cta: Object,
        gallery: Object,
        order: Number,
        status: { type: String, default: 'published' },
      },
      { timestamps: true, strict: false }
    )
  );

  // Series
  let seriesInserted = 0;
  let seriesSkipped = 0;
  for (const s of SERIES_SEED) {
    const exists = await Series.findOne({ slug: s.slug });
    if (exists) { seriesSkipped++; continue; }
    await Series.create(s);
    seriesInserted++;
  }
  console.log(`  · Series: inserted ${seriesInserted}, skipped ${seriesSkipped}.`);

  // Variants
  let variantInserted = 0;
  let variantSkipped = 0;
  for (const v of VARIANT_SEED) {
    const series = await Series.findOne({ slug: v.seriesSlug });
    if (!series) {
      console.warn(`    ⚠ Variant ${v.slug}: series ${v.seriesSlug} not found, skipping.`);
      continue;
    }
    const exists = await Variant.findOne({ slug: v.slug });
    if (exists) { variantSkipped++; continue; }
    const { seriesSlug, ...rest } = v;
    await Variant.create({ ...rest, seriesId: series._id });
    variantInserted++;
  }
  console.log(`  · Variants: inserted ${variantInserted}, skipped ${variantSkipped}.`);
}

async function main() {
  console.log('Connecting to Mongo…');
  await mongoose.connect(MONGODB_URI!);
  try {
    console.log('Seeding admin user…');
    await seedAdmin();
    console.log('Seeding FAQ…');
    await seedFaq();
    console.log('Seeding Blog…');
    await seedBlog();
    console.log('Seeding Products (Series + Variants)…');
    await seedProducts();
    console.log('Done.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
