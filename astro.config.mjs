// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // The site lives at the free GitHub Pages address (no custom domain, by Gabriele's choice).
  // Staging builds are marked noindex until launch.
  site: 'https://gabrieleserussi.github.io',
  integrations: [sitemap()],
});
