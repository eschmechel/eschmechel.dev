// 14 KB first-flight budget: each page's HTML (CSS + JS inlined) must fit in the first TCP
// round trip (~10 packets ≈ 14.6 KB) gzipped, with nothing render-blocking fetched separately.
// gzip is checked because it's the worst case; Cloudflare serves brotli where it can.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET = 14_000;
const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) pages.push(p);
  }
})('dist');

let failed = 0;
for (const page of pages) {
  const html = readFileSync(page);
  const gz = gzipSync(html, { level: 9 }).length;
  const text = html.toString();
  const blocking = [
    ...text.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g),
    ...text.matchAll(/<script(?![^>]*type="module")[^>]+src=[^>]*>/g),
  ].map((m) => m[0]);
  const ok = gz <= BUDGET && blocking.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${page.padEnd(28)} ${String(gz).padStart(6)} B gz / ${BUDGET}${blocking.length ? `  blocking: ${blocking.join(' ')}` : ''}`);
}
process.exit(failed ? 1 : 0);
