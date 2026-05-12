import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Site URL: used for canonical/sitemap. Adjust to your final domain.
const site = process.env.ASTRO_SITE || 'https://alm44.pages.dev';

export default defineConfig({
  site,
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
