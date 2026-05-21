# Hike RV CMS — local setup

Custom MongoDB-backed CMS for the Hike RV site. Built incrementally to the plan at `~/.claude/plans/need-to-build-custom-mossy-neumann.md`. **Phases 1–8 are done locally** (not yet pushed to git).

## What's working

### Public site
- All existing routes render unchanged when Mongo is unconfigured (graceful fallback to seed data).
- `/faq`, `/blogs`, `/blogs/[slug]`, `/grand-rover-196` now fetch from Mongo at build time and fall back to in-repo seed data.

### Admin app (SSR, gated by JWT cookie + RBAC)
| Path | Purpose |
|---|---|
| `/admin/login` | Email + password sign-in |
| `/admin` | Dashboard |
| `/admin/products` | Series + variant list, grouped by series |
| `/admin/products/[id]` | Full variant editor — hero, spec icons, spec table (3 packs × 4 categories), Premium Living, 3D Floorplans, CTA |
| `/admin/blog` | Post list |
| `/admin/blog/[id]` | Post editor — HTML body field + hero image picker |
| `/admin/faq` | FAQ section/question editor (drag-style add/remove) |
| `/admin/images` | Image library grid + direct-to-S3 upload |
| `/admin/users` | User management (admin role only) |

### API (all under `/api/*`, gated by middleware)
- `POST /api/auth/login`, `POST /api/auth/logout`
- `GET/POST /api/users`, `PATCH/DELETE /api/users/[id]`
- `GET/PUT /api/faq`
- `GET/POST /api/blog`, `GET/PATCH/DELETE /api/blog/[id]`
- `GET/POST /api/images`, `PATCH/DELETE /api/images/[id]`, `POST /api/images/presign`
- `GET/POST /api/products/series`, `GET/POST /api/products/variants`, `GET/PATCH/DELETE /api/products/variants/[id]`
- `POST /api/publish` — triggers the configured Vercel Deploy Hook

### Roles
| Role | Can |
|---|---|
| **admin** | Everything, including user management |
| **editor** | All content edits + publish |
| **viewer** | Read-only API access |

## Setup

1. **MongoDB Atlas** — create a free cluster, copy the connection string.
2. **`.env`** — copy `.env.example` and fill in:
   - `MONGODB_URI`
   - `JWT_SECRET` (`openssl rand -base64 48`)
   - `BOOTSTRAP_ADMIN_EMAIL` + `BOOTSTRAP_ADMIN_PASSWORD`
   - For Phase 6 image uploads: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `CLOUDFRONT_URL`
   - For Phase 8 publish: `VERCEL_BUILD_HOOK` (create in Vercel project settings → Git → Deploy Hooks)
3. **Seed**:
   ```
   npm run seed
   ```
   Creates the bootstrap admin user, copies the FAQ + Blog + Products seed data into Mongo. Idempotent — re-runs only insert missing rows.
4. **Run**:
   ```
   npm run dev
   ```
5. Visit `/admin/login`, sign in, edit something, click **Publish** in the top bar to trigger a rebuild.

## Architecture

- **Astro hybrid** (`astro.config.mjs` → `output: 'static'` + Vercel adapter). Pages default to SSG. Admin routes and `/api/*` opt into SSR via `export const prerender = false`.
- **Mongoose** with a cached singleton connection so the build doesn't open a new pool for each page.
- **Auth**: bcrypt-hashed passwords; signed JWT in an httpOnly cookie; `src/middleware.ts` gates `/admin/*` and `/api/*` (except `/api/auth/login`); `hasRole()` does per-role checks in each handler.
- **Images**: admin requests a pre-signed PUT URL from `/api/images/presign`, uploads directly to S3, then POSTs metadata to `/api/images`. Public URL stored in Mongo is the CloudFront URL (falls back to `<bucket>.s3.<region>.amazonaws.com`).
- **Publish**: `POST /api/publish` calls `VERCEL_BUILD_HOOK`. Build runs, fetches latest content from Mongo, regenerates static HTML.
- **Seed-as-fallback** pattern: every loader (`src/lib/cms/*.ts`) tries Mongo first and falls back to in-repo seed data. Builds never break before Mongo is configured.

## Migration recipe for the remaining 12 model pages

Only `grand-rover-196.astro` has been refactored end-to-end as proof. To migrate the other 12:

```
grand-rover-206, grand-rover-216, grand-rover-infinity,
wild-drifter-196, wild-drifter-206,
tanzanite-21, amore-22,
atom, atom-17-2, atom-17-8,
huttle, armadillo, eco-186
```

For each page:

1. **Extract** the page's hardcoded data into a new entry in `src/lib/cms/productSeed.ts`'s `VARIANT_SEED` array — hero, specIcons, specTable, premiumLiving, floorplans, cta.
2. **Re-run seed** locally: `npm run seed` (idempotent; only inserts new variants).
3. **Replace** the page's contents with the same wrapper used by `grand-rover-196.astro`:
   ```astro
   ---
   import VariantPage from '../templates/VariantPage.astro';
   import { loadVariantBySlug } from '../lib/cms/products';
   const variant = await loadVariantBySlug('grand-rover-206');
   if (!variant) return Astro.redirect('/grand-rover');
   ---
   <VariantPage variant={variant} seriesHref="/grand-rover" seriesLabel="Grand Rover Series" />
   ```
4. **Smoke-test** `/grand-rover-206` renders identically.

Pages that have bespoke sections beyond what `VariantPage` renders (e.g. extra galleries, custom mood-board overrides) will need `VariantPage` extended to handle them — or the page can keep custom JSX alongside `<VariantPage>`.

`grand-rover-196.astro.bak` is the pre-refactor backup, kept locally for diff reference. Delete it once the pattern is proven.

## What's NOT done yet

### Phase 9 — Polish (deferred)
- Audit log (who changed what, when)
- Draft status for variants (currently every save is "live in Mongo"; only `publishedAt` defers visibility for blog posts)
- Preview URL for drafts (SSR route, admin-cookie gated)
- Stronger Zod validation reused on both client + API
- Rich-text editor for blog body (currently a plain HTML textarea — Tiptap planned)

### Outside CMS scope (flagged in plan)
- i18n / multi-language
- Analytics dashboard in admin
- Versioning / undo
- A/B testing or feature flags
- Blog comments
- Search across CMS content

## Notes & gotchas

- **Building without Mongo works** — every loader has a seed fallback. Useful for unrelated edits and CI.
- **Building with Mongo** will hit `MONGODB_URI` at build time. The Vercel build environment must have all `.env` vars set.
- **AWS Amplify** can't host the admin (it's SSR). Run the CMS on Vercel. If you want to keep an Amplify static mirror for the public site, that's fine — but `Publish` only rebuilds the Vercel deploy.
- **Image uploads require CORS on the S3 bucket** to accept PUT from the admin origin. Add a CORS policy allowing `PUT` from your deploy URL + `localhost:4321`.
- **CloudFront cache** — when an image is replaced in S3, CloudFront may serve a stale copy. Either use a new filename per upload (current behaviour — keys include a timestamp) or invalidate after delete.
- **The `.bak` of the old grand-rover-196.astro** is left in the repo for reference but not used. Safe to delete once you're happy with the new template.
