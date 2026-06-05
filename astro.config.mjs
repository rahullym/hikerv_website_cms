// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';

// Full SSR: every page is rendered server-side on each request. This makes
// CMS edits visible on the public site instantly — no Vercel rebuild
// required. Trade-offs:
//   - Higher cold-start / per-request latency than static (~100–300ms).
//   - More serverless function invocations on Vercel (cost / quota).
//   - HTML cannot be CDN-cached the same way as static output.
// If a specific page is content-stable and high-traffic enough that the
// cost matters, opt it back into static rendering by adding
// `export const prerender = true;` to its frontmatter.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  // Astro's default Origin check (security.checkOrigin) was rejecting
  // same-origin admin PATCH/DELETE/POST requests behind Vercel's edge with
  // 403 "Cross-site POST form submissions are forbidden". CSRF protection
  // for our admin API is already provided by:
  //   - SameSite=Lax session cookie (browsers won't send it on cross-site
  //     POSTs — see sessionCookieAttributes in src/lib/auth/jwt.ts), and
  //   - explicit session/role checks in src/middleware.ts and each handler.
  // Disabling the redundant Origin check unblocks publish, save and delete.
  security: { checkOrigin: false },
  vite: {
    plugins: [tailwindcss()]
  }
});
