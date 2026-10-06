// Asserts the rendered banner is exactly figlet's Small Slant output (no hand-copy drift).
import { readFileSync } from 'node:fs';
import figlet from 'figlet';

const want = figlet
  .textSync('eschmechel', { font: 'Small Slant' })
  .split('\n')
  .map((l) => l.trimEnd())
  .filter((l) => l.length)
  .join('\n');
const html = readFileSync('dist/index.html', 'utf8');
const raw = html.match(/<pre class="banner[^>]*>([\s\S]*?)<\/pre>/)?.[1] ?? '';
const got = raw
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#3?9;|&#x27;/g, "'")
  .replace(/&amp;/g, '&');
if (got !== want) {
  console.error('banner mismatch\n--- want\n' + want + '\n--- got\n' + got);
  process.exit(1);
}
