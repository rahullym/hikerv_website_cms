// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';

// Hybrid output: pages are static by default; admin/api routes opt into SSR
// via `export const prerender = false;` in their frontmatter.
export default defineConfig({
  output: 'static',
  // Inline CSS into the HTML so no external stylesheet blocks first paint.
  build: { inlineStylesheets: 'always' },
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  }
});
