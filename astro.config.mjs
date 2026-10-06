// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://eschmechel.dev',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
