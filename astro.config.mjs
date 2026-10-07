// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://eschmechel.dev',
  output: 'static',
  trailingSlash: 'never', // matches wrangler.toml html_handling = drop-trailing-slash
  // CSS is inlined so one HTML response (≤14 KB gzipped) can paint the page — see tests/budget.check.mjs
  build: { format: 'directory', inlineStylesheets: 'always' },
  // scoped styles as classes (not data-astro-cid-* attributes) — fewer bytes on every element
  scopedStyleStrategy: 'class',
  // JS only enhances server-rendered pages, so keep it out of the first 14 KB as deferred modules
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'vitesse-dark', wrap: false },
  },
});
