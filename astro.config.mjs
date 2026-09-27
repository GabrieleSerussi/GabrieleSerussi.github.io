// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Canonical address from day one; staging builds are marked noindex until launch.
  site: 'https://gabrieleserussi.com',
  integrations: [sitemap()],
});
