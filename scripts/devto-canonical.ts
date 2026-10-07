// Point each dev.to cross-post's canonical_url at its copy on eschmechel.dev (Phase 9 / Q50), so
// search engines credit the site instead of dev.to.
//
//   npm run devto:canonical             dry run — prints what would change, writes nothing
//   npm run devto:canonical -- --apply  writes; needs DEVTO_API_KEY in .env (git-ignored)
//
// Only touches articles imported into src/content/blog (matched by frontmatter devto.id) whose
// canonical isn't already the site URL. After each write it re-reads the article and fails loudly
// if anything but canonical_url changed.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const SITE = 'https://eschmechel.dev';
const API = 'https://dev.to/api';
const DIR = 'src/content/blog';
const apply = process.argv.includes('--apply');
const key = process.env.DEVTO_API_KEY;

interface Article {
  id: number;
  title: string;
  canonical_url: string;
  body_markdown?: string;
}

const hash = (s = '') => createHash('sha256').update(s).digest('hex').slice(0, 12);

async function getAuthed(id: number): Promise<Article> {
  // the authed endpoint always includes body_markdown and isn't served from the public cache
  const res = await fetch(`${API}/articles/${id}`, { headers: { 'api-key': key!, accept: 'application/vnd.forem.api-v1+json' } });
  if (!res.ok) throw new Error(`GET ${id}: ${res.status}`);
  return res.json() as Promise<Article>;
}

if (apply && !key) {
  console.error('DEVTO_API_KEY is not set. Put it in .env (git-ignored) and run with --apply again.');
  process.exit(1);
}

const posts = readdirSync(DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const id = Number(/^devto:\s*\n\s+id:\s*(\d+)/m.exec(readFileSync(join(DIR, f), 'utf8'))?.[1]);
    return { id, target: `${SITE}/blog/${basename(f, '.md')}` };
  })
  .filter((p) => p.id);

let changed = 0;
let failed = 0;
for (const { id, target } of posts) {
  const before = key ? await getAuthed(id) : ((await (await fetch(`${API}/articles/${id}`)).json()) as Article);
  if (before.canonical_url === target) {
    console.log(`  skip  ${id}  already ${target}`);
    continue;
  }
  console.log(`  ${apply ? 'write' : 'would'} ${id}  ${before.title}\n        ${before.canonical_url}\n     →  ${target}`);
  if (!apply) continue;

  const res = await fetch(`${API}/articles/${id}`, {
    method: 'PUT',
    headers: { 'api-key': key!, 'content-type': 'application/json', accept: 'application/vnd.forem.api-v1+json' },
    body: JSON.stringify({ article: { canonical_url: target } }),
  });
  if (!res.ok) {
    failed++;
    console.log(`  FAIL  ${id}  PUT ${res.status} ${(await res.text()).slice(0, 200)}`);
    continue;
  }
  const after = await getAuthed(id);
  const ok = after.canonical_url === target && after.title === before.title && hash(after.body_markdown) === hash(before.body_markdown);
  if (ok) changed++;
  else failed++;
  console.log(`  ${ok ? 'ok   ' : 'FAIL '} ${id}  canonical=${after.canonical_url === target} title=${after.title === before.title} body=${hash(before.body_markdown)}→${hash(after.body_markdown)}`);
}

console.log(`devto:canonical — ${apply ? `${changed} updated, ${failed} failed` : 'dry run (pass --apply to write)'}`);
process.exit(failed ? 1 : 0);
