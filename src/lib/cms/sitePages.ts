/**
 * SEO defaults for non-CMS static + landing pages (homepage, series landings,
 * about, contact, etc). Same dual-role as the Variant/Blog seed:
 *   - source of truth for npm run seed (upserts initial SitePage rows)
 *   - render fallback when Mongo is unreachable so the build never breaks
 *
 * To make a new page CMS-editable:
 *   1. Add an entry here.
 *   2. Run npm run seed.
 *   3. In the page's frontmatter, call:
 *        const pageSeo = await loadPageSeo('your-slug');
 *      and pass the fields to <Layout>.
 */

export interface SitePageSeed {
  slug: string;
  label: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonical: string;
}

export const SITE_PAGE_SEED: SitePageSeed[] = [
  {
    slug: 'home',
    label: 'Homepage (/)',
    title: 'Off Road Caravans Australia | Luxury Family & Couples Caravans — Hike RV',
    description: 'Hike RV — Australian made off road, off grid and luxury caravans for families and couples. Explore touring, hybrid and semi off road models built for any terrain.',
    keywords: 'off road caravans Australia, family caravans Australia, couples caravans Australia, luxury caravans Australia, off grid caravans, Australian made caravans, hybrid caravans Australia, touring caravans Australia, best off road caravans, affordable luxury caravans, Hike RV, Hike RV Caravans, Hike caravans',
    ogImage: '/assets/hero.png',
    canonical: 'https://hikervcaravans.com.au/',
  },
  {
    slug: 'about',
    label: 'About (/about)',
    title: 'About Hike RV — Australian Made Caravans | Melbourne, VIC',
    description: 'Hike RV is an Australian caravan manufacturer building off road, off grid and luxury caravans for families and couples. Engineered in Melbourne, Victoria.',
    keywords: 'Australian made caravans, caravan manufacturers Australia, Hike RV, Hike RV Caravans, Hike caravans, caravans Melbourne, caravans Victoria, off road caravans Australia, luxury caravans Australia, best off road caravans, best family caravans Australia',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/about',
  },
  {
    slug: 'contact',
    label: 'Contact (/contact)',
    title: 'Contact Hike RV — Buy a Caravan Australia | Get a Quote',
    description: 'Talk to Hike RV about buying an off road, family or luxury caravan. Australian made caravans, Melbourne-based, dealers across Victoria and Australia.',
    keywords: 'buy caravan Australia, caravan for sale Australia, Hike RV prices, Hike RV contact, caravan EOFY sale, affordable luxury caravans, caravans Melbourne, caravans Victoria, Australian made caravans',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/contact',
  },
  {
    slug: 'dealers',
    label: 'Dealers (/dealers)',
    title: 'Caravan Dealers — Melbourne & Australia | Hike RV',
    description: 'Find a Hike RV caravan dealer near you. Showrooms across Melbourne, Victoria and Australia stocking off road, family and luxury caravans.',
    keywords: 'caravan dealer Melbourne, caravans Melbourne, caravans Victoria, off road caravans Melbourne, buy caravan Australia, Hike RV dealers, Australian caravans VIC',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/dealers',
  },
  {
    slug: 'service-centers',
    label: 'Service Centres (/service-centers)',
    title: 'Caravan Service Centres Australia | Hike RV',
    description: 'Authorised Hike RV caravan service centres across Australia — repairs, maintenance and warranty work for off road, family and luxury caravans.',
    keywords: 'caravan service Australia, Hike RV service, caravan repairs Australia, caravan warranty Australia, caravans Melbourne, caravans Victoria, Australian made caravans',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/service-centers',
  },
  {
    slug: 'warranty',
    label: 'Warranty (/warranty)',
    title: 'Caravan Warranty Australia | Hike RV Coverage',
    description: 'Hike RV warranty — comprehensive coverage on Australian made off road, family and luxury caravans. Peace of mind on every journey.',
    keywords: 'caravan warranty Australia, Hike RV warranty, Australian made caravans, off road caravans Australia, luxury caravans Australia, caravan service Australia',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/warranty',
  },
  {
    slug: 'faq',
    label: 'FAQ (/faq)',
    title: 'Caravan Buying Guide & FAQ | Hike RV Australia',
    description: 'Common questions about Hike RV off road, family and luxury caravans — construction, off grid setup, warranty and the buying process in Australia.',
    keywords: 'caravan buying guide Australia, off road caravan tips, caravan towing guide, Hike RV FAQ, Hike RV prices, off road caravans Australia, luxury caravans Australia, off grid caravans, best off road caravans, affordable luxury caravans',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/faq',
  },
  {
    slug: 'blogs',
    label: 'Blog index (/blogs)',
    title: 'Caravan Blog — Off Road & Touring Tips Australia | Hike RV',
    description: 'Off grid travel tips, caravan buying guides and touring advice for Australia. Product updates from Hike RV — off road, family and luxury caravans.',
    keywords: 'caravan buying guide Australia, off road caravan tips, caravan towing guide, caravan solar setup guide, best caravan for travelling Australia, best off road caravans, best family caravans Australia, Hike RV blog, off grid caravans',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/blogs',
  },
  {
    slug: 'gallery',
    label: 'Gallery (/gallery)',
    title: 'Caravan Gallery — Off Road, Family & Luxury Caravans | Hike RV',
    description: 'Hike RV gallery — interior, exterior and 3D layouts of our off road, family and luxury caravans built in Australia.',
    keywords: 'off road caravans Australia, family caravans Australia, luxury caravans Australia, Hike RV gallery, caravan interior, caravan layouts, Australian made caravans',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/gallery',
  },
  {
    slug: 'videos',
    label: 'Videos (/videos)',
    title: 'Caravan Videos — Off Road & Touring Australia | Hike RV',
    description: 'Watch Hike RV off road, family and luxury caravans in action across Australia. Walkthroughs, reviews and off grid touring.',
    keywords: 'Hike RV videos, off road caravans Australia, caravan reviews Australia, Hike RV reviews, luxury caravans Australia, family caravans Australia',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/videos',
  },
  {
    slug: 'testimonials',
    label: 'Testimonials (/testimonials)',
    title: 'Hike RV Reviews & Testimonials — Caravans Australia',
    description: 'Authentic Hike RV reviews from Australian owners — off road, family and luxury caravan stories from the road.',
    keywords: 'Hike RV reviews, caravan reviews Australia, Hike RV testimonials, off road caravans Australia, family caravans Australia, luxury caravans Australia',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/testimonials',
  },
  {
    slug: 'privacy',
    label: 'Privacy Policy (/privacy)',
    title: 'Privacy Policy | Hike RV Caravans',
    description: 'How Hike RV collects, uses, stores, and discloses your personal information in accordance with the Australian Privacy Principles and the Privacy Act 1988 (Cth).',
    keywords: 'privacy policy, Hike RV, Australian privacy, Privacy Act 1988',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/privacy',
  },
  // ── Series landing pages ────────────────────────────────────
  {
    slug: 'drifter',
    label: 'Drifter Series (/drifter)',
    title: 'Drifter Series — Couples Caravans Australia | Hike RV',
    description: 'The Drifter Series — luxury couples caravans Australia, engineered for off road touring and off grid freedom. Compact, efficient, premium fit-out.',
    keywords: 'couples caravans Australia, off road caravans Australia, luxury caravans Australia, off grid caravans, Drifter caravan, Hike RV Drifter, hybrid caravans Australia, best off road caravans',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/drifter',
  },
  {
    slug: 'rover',
    label: 'Rover Series (/rover)',
    title: 'Rover Series — Family Caravans Australia | Hike RV',
    description: 'The Rover Series — family caravans Australia built for the long haul. Off road touring, triple-bunk layouts and luxury family living.',
    keywords: 'family caravans Australia, best family caravans Australia, off road caravans Australia, triple bunk caravans Australia, family bunk caravans Australia, Rover caravan, Hike RV Rover, touring caravans Australia',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/rover',
  },
  {
    slug: 'grand-rover',
    label: 'Grand Rover Series (/grand-rover)',
    title: 'Grand Rover — Luxury Family Caravans Australia | Hike RV',
    description: 'Grand Rover — luxury family caravans Australia. Spacious beds, tailored storage and off road capability for unforgettable family adventures.',
    keywords: 'family caravans Australia, best family caravans Australia, luxury caravans Australia, off road caravans Australia, family bunk caravans Australia, Grand Rover, Hike RV Grand Rover, triple bunk caravans Australia',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/grand-rover',
  },
  {
    slug: 'wild-drifter',
    label: 'Wild Drifter Series (/wild-drifter)',
    title: 'Wild Drifter — Off Road Caravans Australia | Hike RV',
    description: 'Wild Drifter — luxury off road couples caravan Australia. Off grid ready, all-terrain chassis, premium finish. Style meets freedom on the long haul.',
    keywords: 'off road caravans Australia, couples caravans Australia, luxury caravans Australia, off grid caravans, Wild Drifter caravan, Wild Drifter 22ft, Hike RV Wild Drifter, hybrid caravans Australia, best off road caravans',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/wild-drifter',
  },
  {
    slug: 'elite',
    label: 'Elite Series (/elite)',
    title: 'Elite Series — Luxury Caravans Australia | Hike RV',
    description: 'The Elite Series — luxury caravans Australia at the pinnacle of engineering. Premium materials, off road capability and cutting-edge technology.',
    keywords: 'luxury caravans Australia, affordable luxury caravans, off road caravans Australia, best off road caravans, Elite series caravan, Hike RV Elite, Australian made caravans, touring caravans Australia, off grid caravans',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/elite',
  },
  {
    slug: 'eco',
    label: 'Eco Series (/eco)',
    title: 'Eco Series — Off Grid Caravans Australia | Hike RV',
    description: 'The Eco Series — off grid caravans Australia. Lightweight, smart layouts and off road capability for sustainable, solar-powered adventures.',
    keywords: 'off grid caravans, off grid caravan package, off road caravans Australia, solar caravans Australia, lithium battery caravans, caravan with diesel heater, Eco caravan, Hike RV, 12V caravan Australia',
    ogImage: '',
    canonical: 'https://hikervcaravans.com.au/eco',
  },
];

export interface PageSeo {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonical: string;
}

/**
 * Load SEO meta for a non-CMS page. Tries Mongo first (so editor changes are
 * live immediately); falls back to the seed values if Mongo is unreachable
 * or the row hasn't been created yet. Always returns a populated PageSeo —
 * never throws.
 */
export async function loadPageSeo(slug: string): Promise<PageSeo> {
  const seed = SITE_PAGE_SEED.find((p) => p.slug === slug);
  const fallback: PageSeo = seed
    ? {
        title: seed.title,
        description: seed.description,
        keywords: seed.keywords,
        ogImage: seed.ogImage,
        canonical: seed.canonical,
      }
    : { title: '', description: '', keywords: '', ogImage: '', canonical: '' };

  if (!import.meta.env.MONGODB_URI) return fallback;
  try {
    const { connectDB } = await import('../db');
    const { SitePage } = await import('../db/models/SitePage');
    await connectDB();
    const doc = await SitePage.findOne({ slug }).lean();
    if (!doc) return fallback;
    // Merge: any empty Mongo field falls back to seed so editors can clear a
    // single field without nuking the whole row.
    return {
      title: (doc.title || '').trim() || fallback.title,
      description: (doc.description || '').trim() || fallback.description,
      keywords: (doc.keywords || '').trim() || fallback.keywords,
      ogImage: (doc.ogImage || '').trim() || fallback.ogImage,
      canonical: (doc.canonical || '').trim() || fallback.canonical,
    };
  } catch (err) {
    console.warn('[sitePages] Mongo unavailable, falling back to seed:', (err as Error).message);
    return fallback;
  }
}
