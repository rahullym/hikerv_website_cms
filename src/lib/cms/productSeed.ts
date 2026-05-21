/**
 * Hardcoded fallback / seed for Series + Variant. Currently contains:
 *   - Grand Rover series + variant "grand-rover-196" (full data extracted
 *     from src/pages/grand-rover-196.astro at the time of writing).
 *
 * To migrate another model page into the CMS:
 *   1. Add the series entry below if missing.
 *   2. Add a variant entry with the page's data (hero, specIcons, specTable,
 *      premiumLiving, floorplans, cta, gallery).
 *   3. Run `npm run seed` so Mongo has the row.
 *   4. Replace the page's frontmatter and body with a wrapper that imports
 *      <VariantPage> and calls loadVariantBySlug('your-slug').
 *
 * The seed is the source of truth for both:
 *   - the `npm run seed` script (one-time Mongo insert)
 *   - the public render fallback when Mongo is unreachable, so builds never
 *     break before the CMS is configured.
 */

import type { VariantDoc } from '../db/models/Variant';

export interface SeriesSeed {
  slug: string;
  name: string;
  accentColor: string;
  order: number;
}

// Strip Mongo-specific fields for the public render path; keep the rest 1:1
export type VariantSeed = Omit<VariantDoc, '_id' | 'seriesId' | 'createdAt' | 'updatedAt'> & {
  seriesSlug: string;
};

export const SERIES_SEED: SeriesSeed[] = [
  { slug: 'grand-rover', name: 'Grand Rover', accentColor: '#E50000', order: 1 },
  { slug: 'wild-drifter', name: 'Wild Drifter', accentColor: '#E50000', order: 2 },
  { slug: 'tanzanite', name: 'Tanzanite', accentColor: '#E50000', order: 3 },
  { slug: 'amore', name: 'Amore', accentColor: '#E50000', order: 4 },
  { slug: 'atom', name: 'Atom', accentColor: '#E50000', order: 5 },
  { slug: 'huttle', name: 'Hütte', accentColor: '#E50000', order: 6 },
  { slug: 'armadillo', name: 'Armadillo', accentColor: '#D4AF37', order: 7 },
  { slug: 'eco', name: 'Eco', accentColor: '#E50000', order: 8 },
];

export const VARIANT_SEED: VariantSeed[] = [
  {
    seriesSlug: 'grand-rover',
    slug: 'grand-rover-196',
    name: 'Grand Rover 19.6',
    status: 'published',
    order: 1,
    hero: {
      kicker: 'Model 19.6ft · 2 Bunk',
      title: 'Family.',
      subtitle: 'Grand Rover 19.6ft',
      body: 'The compact Grand Rover, sized for easier towing and tighter sites — without losing the bunk beds, ensuite, or kitchen the family relies on.',
      heroImage: '/assets/GRANDROVER 19.6.jpg',
      brochureUrl: '/brochures/GRANDROVER.pdf',
      quickStats: [],
    },
    specIcons: [
      { icon: 'inverter', value: '3000W', caption: 'Inverter' },
      { icon: 'lounge', value: 'Premium Leatherette', caption: 'L-Lounge Convertible' },
      { icon: 'fridge', value: '224L Dometic', caption: 'Compressor Fridge' },
      { icon: 'frame', value: 'Aluminum', caption: 'Rivitec Frame' },
      { icon: 'suspension', value: 'Tuffride L3', caption: 'Airbag Susp.' },
      { icon: 'washer', value: '3kg Front-load', caption: 'Washing Machine' },
      { icon: 'battery', value: '2 × 300Ah', caption: 'Lithium' },
      { icon: 'solar', value: '5 × 210W', caption: 'Solar Panel' },
    ],
    specTable: {
      ultra: {
        chassis: ['New style chassis', 'Extended 2200mm A-frame', '3.5T Tuffride Stage 3 Airbag suspension', 'DO-35 hitch', '265/75/R16 tyres', 'Black Jack-Master jockey wheel', '2× 105L fresh water tanks', '1× 105L grey water tank', '50L drinking water tank', 'Stoneguard', 'Large twin-slide universal toolbox', 'Bumper bar with woodbox & jerry', 'Composite panels cladding', 'Plain Raven sheet 800mm bottom', 'XPS insulation', 'Manual double pullout step', 'Recessed picnic table with shelves', 'Carefree Electric awning', 'Sahara Caravan dust reduction'],
        furniture: ['Lightweight cabinetry', 'Waterfall benchtop', 'Full aluminium frame shell', 'Cortina Hex sliding door', 'External TV box', '3× LED strips in overhead cupboards', 'Softclose draw runners', 'Mirrored shower perspex', 'Telescopic table', 'Aussie Traveller EV2 windows', 'Double bedroom windows', '2 headrests', 'Lounge padding', 'Round mag pocket', 'Recessed footrest'],
        electrical: ['14" LED bar light (front & back)', '1× 14" bar light each side (work lights)', 'Victron Off-Grid Multi-3000 BMS', '2× 300Ah Lithium batteries', '5× 200W solar panels', 'Portable solar', 'Step strip light', 'Fusion MSRA60 kit stereo', '2× 12V fans in bedroom'],
        plumbing: ['Dometic 224L Compressor fridge', '29L NCE 4-in-1 microwave', 'Camec 2.3kW induction cooktop', 'Suburban Instant HWS + water-saving valve', 'OGO Compost toilet', 'Hot & cold taps near bayonet', 'AU Focus diesel heater', '3.2kg top-load washing machine', 'External shower'],
      },
      terrain: {
        chassis: ['Standard chassis', 'Extended 1900mm A-frame', '3.3T Tuffride Independent suspension', 'DO-35 hitch', '245/75/R16 tyres', 'Top Winder 8" jockey wheel', '2× 105L fresh water tanks', '1× 105L grey water tank', 'Medium twin-slide toolbox', 'Standard 3-arm rear bumper', 'Composite panels cladding', 'Checkerplate 600mm bottom', 'Polystyrene insulation', 'Manual single pullout step', 'Standard picnic table', 'ATRV rollout awning'],
        furniture: ['Standard cabinetry', 'Waterfall benchtop', 'Hybrid AL-frame + rot-free shell', 'Standard sliding door', 'Softclose draw runners', 'Frosted shower perspex', 'Telescopic table', 'SJ RV flat acrylic windows', 'Lounge padding', 'Square mag pocket'],
        electrical: ['LED Annex light (front & back)', 'Projecta PM335C + 4" display BMS', '2× 150Ah Lithium batteries', '2× 200W solar panels', 'ATRV stereo'],
        plumbing: ['Dometic 188L Compressor fridge', '20L NCE microwave', 'Swift Mini Grill cooker', 'Swift 28L HWS', 'Thetford cassette toilet', '3.2kg top-load washing machine', 'External shower'],
      },
      hiker: {
        chassis: ['Standard chassis', 'Standard 1650mm A-frame', '3.2T Roller Rocker suspension', '50mm ball hitch', '235/75/R15 tyres', 'Top Winder 8" jockey wheel', '2× 105L fresh water tanks', 'Standard 3-arm rear bumper', 'Corrugated panels cladding', 'Checkerplate 300mm bottom', 'Polystyrene insulation', 'Manual single pullout step', 'Standard picnic table', 'ATRV rollout awning'],
        furniture: ['Standard cabinetry', 'Meranti Timber shell', 'Standard sliding door', 'Standard draw runners', 'Frosted shower perspex', 'Standard table', 'SJ RV flat acrylic windows', 'Square mag pocket'],
        electrical: ['Projecta PM335C + 4" display BMS', '1× 150Ah Lithium battery', '2× 200W solar panels', 'ATRV stereo'],
        plumbing: ['Dometic 188L 3-way fridge', '20L NCE microwave', 'Swift Mini Grill cooker', 'Swift 28L HWS', 'Thetford cassette toilet'],
      },
    },
    premiumLiving: {
      heading: 'Family-First Layout.',
      body: 'Two dedicated bunks for the kids, an island queen for the parents, and a swing-around dinette that converts to extra sleeping when needed — the 19.6 carries four (or five) without ever feeling cramped. The full kitchen runs a 188-litre fridge, recessed mini-grill, microwave, and proper benchtop space. The fully separate shower and toilet keeps the morning routine flowing — and the L-shape lounge is the after-dark headquarters when the kids are down.',
      images: [
        '/rover/grandrover/19.6 Family First/1.jpg',
        '/rover/grandrover/19.6 Family First/2.jpg',
        '/rover/grandrover/19.6 Family First/3.jpg',
      ],
      chips: ['Bunk beds', 'Full ensuite', 'L-Lounge', 'Front kitchen'],
    },
    floorplans: [
      { title: 'Grand Rover 19.6 · 2 Bunk', desc: 'Family-Ready Floorplan', src: '/3D LAYOUTS 2024/3D LAYOUT NEW UPDATED AUG 2025/GRAND ROVER 19.6 2 BUNK.png' },
    ],
    cta: {
      kicker: 'Your Family Adventure Starts Here',
      heading: 'Ready For The Grand Rover 19.6?',
      body: 'Contact our team to configure your Grand Rover 19.6 for your next adventure.',
    },
    gallery: { exterior: [], interior: [] },
  },
];
