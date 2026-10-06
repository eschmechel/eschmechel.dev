// Import dev.to articles into src/content/blog as local Markdown (D51).
// eschmechel.dev is the canonical home; dev.to becomes the cross-post (see docs/PLAN, Q50).
//
//   npm run sync:devto            import articles that don't exist locally yet
//   npm run sync:devto -- --force re-import everything (overwrites local edits)
//
// Body images are downloaded next to the posts so Astro can optimise them and the site
// never depends on dev.to's CDN. Liquid tags ({% embed %} etc.) become plain links.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import sharp from 'sharp';

const USER = 'eschmechel';
const API = 'https://dev.to/api';
const OUT = 'src/content/blog';
const IMAGES = join(OUT, 'images');
const force = process.argv.includes('--force');

interface Summary {
  id: number;
  slug: string;
}
interface Article {
  id: number;
  title: string;
  description: string;
  slug: string;
  url: string;
  published_at: string;
  edited_at: string | null;
  tags: string[] | string;
  cover_image: string | null;
  body_markdown: string;
}

async function json<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: 'application/vnd.forem.api-v1+json' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json() as Promise<T>;
}

/** dev.to slugs end in a random 4-char suffix: "my-post-3fkn" → "my-post". */
const localSlug = (slug: string) => slug.replace(/-[a-z0-9]{4}$/, '');

const yaml = (s: string) => JSON.stringify(s); // JSON strings are valid YAML scalars

function liquidToMarkdown(body: string): string {
  return body.replace(/\{%\s*(\w+)\s+([^%]+?)\s*%\}/g, (_m, tag: string, arg: string) => {
    const a = arg.trim().replace(/^["']|["']$/g, '');
    switch (tag) {
      case 'github':
        return `[github.com/${a.split(/\s/)[0]}](https://github.com/${a.split(/\s/)[0]})`;
      case 'youtube':
        return `[YouTube video](https://www.youtube.com/watch?v=${a})`;
      case 'embed':
      case 'link':
        return `[${a}](${a})`;
      default:
        return `<!-- dev.to {% ${tag} %} omitted: ${a} -->`;
    }
  });
}

async function localiseImages(body: string, slug: string): Promise<string> {
  let n = 0;
  const urls = [...body.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
  for (const url of new Set(urls)) {
    n++;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ! image ${res.status}, left remote: ${url}`);
      continue;
    }
    const type = res.headers.get('content-type') ?? '';
    const bytes = Buffer.from(await res.arrayBuffer());
    // Stills are stored as ≤1600px webp to keep the repo light; GIFs stay as-is (animation).
    const gif = type.includes('gif') || extname(new URL(url).pathname) === '.gif';
    const file = `${slug}-${n}${gif ? '.gif' : '.webp'}`;
    writeFileSync(
      join(IMAGES, file),
      gif ? bytes : await sharp(bytes).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 88 }).toBuffer(),
    );
    body = body.split(url).join(`./images/${file}`);
  }
  return body;
}

mkdirSync(IMAGES, { recursive: true });
const list = await json<Summary[]>(`${API}/articles?username=${USER}&per_page=100`);
let written = 0;

for (const { id, slug: remoteSlug } of list) {
  const slug = localSlug(remoteSlug);
  const file = join(OUT, `${slug}.md`);
  if (existsSync(file) && !force) {
    console.log(`  = ${slug} (exists, skipped)`);
    continue;
  }
  const a = await json<Article>(`${API}/articles/${id}`);
  const tags = Array.isArray(a.tags) ? a.tags : a.tags.split(',').map((t) => t.trim()).filter(Boolean);
    // dev.to separates paragraphs with lines holding only a non-breaking space, which
  // Markdown doesn't treat as blank — normalise them so paragraphs don't merge.
  const clean = a.body_markdown.replace(/^[ \t\u00a0]+$/gm, '').replace(/[ \t\u00a0]+$/gm, '').trim();
  const body = await localiseImages(liquidToMarkdown(clean), slug);
  const front = [
    '---',
    `title: ${yaml(a.title)}`,
    `description: ${yaml(a.description.replace(/\s+/g, ' ').trim())}`,
    `pubDate: ${a.published_at.slice(0, 10)}`,
    ...(a.edited_at ? [`updatedDate: ${a.edited_at.slice(0, 10)}`] : []),
    `tags: [${tags.map(yaml).join(', ')}]`,
    'devto:',
    `  id: ${a.id}`,
    `  url: ${yaml(a.url)}`,
    '---',
    '',
  ].join('\n');
  writeFileSync(file, `${front}\n${body}\n`);
  written++;
  console.log(`  + ${slug}`);
}

console.log(`sync:devto — ${written} written, ${list.length - written} skipped (${list.length} on dev.to)`);
