import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.ASTRO_SITE || 'https://alm44.pages.dev';

export default defineConfig({
  site,
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
