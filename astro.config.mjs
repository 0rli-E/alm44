import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://alm44.pages.dev', // TODO: swap for final custom domain
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
