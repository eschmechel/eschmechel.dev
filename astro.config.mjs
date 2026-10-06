// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://eschmechel.dev',
  output: 'static',
  trailingSlash: 'ignore',
  // CSS is inlined so one HTML response (≤14 KB gzipped) can paint the page — see tests/budget.check.mjs
  build: { format: 'directory', inlineStylesheets: 'always' },
});
