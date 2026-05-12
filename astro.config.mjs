import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://alm44.at', // TODO: confirm final domain
  integrations: [sitemap()],
  image: {
    // Sharp is used to optimise photos in src/assets/
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
