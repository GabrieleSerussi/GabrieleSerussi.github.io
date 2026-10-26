// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { execSync } from 'node:child_process';

// The date of the last commit, as every page's lastmod in the sitemap: Bing and Google use it to
// decide when to recrawl. The weekly scheduled rebuild doesn't move it.
const lastmod = (() => {
  try {
    return new Date(execSync('git log -1 --format=%cI', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim());
  } catch {
    return new Date();
  }
})();

export default defineConfig({
  // The site lives at the free GitHub Pages address (no custom domain, by Gabriele's choice).
  // Staging builds are marked noindex until launch.
  site: 'https://gabrieleserussi.github.io',
  integrations: [sitemap({ lastmod })],
});
