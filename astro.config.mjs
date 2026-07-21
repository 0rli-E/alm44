import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Live-Domain. Überschreibbar per ASTRO_SITE, z. B. für Preview-Deploys:
//   ASTRO_SITE=https://alm44.pages.dev npm run build
const site = process.env.ASTRO_SITE || 'https://alm44.at';

export default defineConfig({
  site,
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
