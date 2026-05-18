import type { FaqSection } from '../db/models/Faq';

/**
 * Hardcoded fallback / seed source for FAQ content.
 *
 * - Used as the build-time fallback if Mongo is unreachable or empty (so
 *   `npm run build` works even before the CMS is set up).
 * - Used by `scripts/seed.ts` to populate Mongo on first run.
 */
export const FAQ_SEED: FaqSection[] = [
  {
    category: 'General',
    order: 0,
    items: [
      { q: 'What makes Hike RV caravans different?', a: 'Hike RV caravans are designed for Australian touring conditions with a strong focus on off-grid capability, modern layouts, practical storage, and premium inclusions at competitive pricing.', order: 0 },
      { q: 'Are Hike RV caravans Australian made?', a: 'Hike RV caravans are built to suit Australian conditions using quality components and materials designed for long-term touring and off-road travel.', order: 1 },
      { q: 'Can I customise my caravan?', a: 'Yes. Depending on the model, customers can choose from a range of layouts, colours, upholstery options, electrical upgrades, suspension upgrades, and additional accessories.', order: 2 },
      { q: 'Where are Hike RV caravans located?', a: 'Hike RV is based in Campbellfield, Victoria.', order: 3 },
    ],
  },
  {
    category: 'Off-Grid & Electrical',
    order: 1,
    items: [
      { q: 'Are Hike RV caravans suitable for off-grid camping?', a: 'Yes. Many Hike RV models are designed for off-grid travel with solar systems, lithium batteries, large water capacities, inverter systems, and diesel heaters available.', order: 0 },
      { q: 'What battery systems do you offer?', a: 'Hike RV offers various battery and electrical upgrade options including lithium battery systems, inverter packages, solar upgrades, and advanced battery management systems.', order: 1 },
      { q: 'Can I run air conditioning off-grid?', a: 'This depends on the battery, inverter, and solar setup selected. We can recommend systems based on your travel needs.', order: 2 },
    ],
  },
  {
    category: 'Towing & Weights',
    order: 2,
    items: [
      { q: 'What vehicle do I need to tow a Hike RV caravan?', a: 'Tow vehicle requirements depend on the caravan model, ATM, and payload. Popular tow vehicles include LandCruiser, Ranger, Silverado, Ram, and similar 4WD vehicles.', order: 0 },
      { q: 'What is ATM?', a: 'ATM stands for Aggregate Trailer Mass — the maximum allowable weight of the caravan when fully loaded.', order: 1 },
      { q: 'Do you offer independent suspension?', a: 'Yes. Selected models and upgrade options include independent suspension systems designed for rough Australian conditions.', order: 2 },
    ],
  },
  {
    category: 'Ordering & Warranty',
    order: 3,
    items: [
      { q: 'What warranty do Hike RV caravans include?', a: 'Warranty coverage includes structural and component warranties. Full warranty details are available from our team.', order: 0 },
      { q: 'What is the typical build time?', a: 'Build times vary depending on model availability and customisation options. Please contact our team for current estimated delivery times.', order: 1 },
      { q: 'Do you offer finance?', a: 'Yes. Finance options may be available through approved third-party finance providers.', order: 2 },
      { q: 'Can interstate customers purchase from Hike RV?', a: 'Absolutely. We regularly assist customers across Australia and can help organise transport and handover arrangements.', order: 3 },
    ],
  },
  {
    category: 'Service & Support',
    order: 4,
    items: [
      { q: 'Do you provide after-sales support?', a: 'Yes. Hike RV provides ongoing customer support, warranty assistance, and servicing guidance after delivery.', order: 0 },
      { q: 'Can I book servicing through Hike RV?', a: 'Yes. Servicing and upgrade enquiries can be arranged through our team.', order: 1 },
      { q: 'What is the best caravan for off-grid travel in Australia?', a: 'A good off-grid caravan should include lithium batteries, solar charging, sufficient water storage, quality suspension, and practical layouts suited to long-term travel.', order: 2 },
      { q: 'What size caravan is best for touring Australia?', a: 'Popular touring sizes range from 18ft to 22ft depending on towing preferences, storage requirements, and travel style.', order: 3 },
      { q: 'Is a lithium battery worth it in a caravan?', a: 'Lithium batteries provide faster charging, lighter weight, deeper discharge capability, and better long-term performance for off-grid travel.', order: 4 },
    ],
  },
];
