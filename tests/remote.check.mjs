// Smoke-check a deployed site: node tests/remote.check.mjs https://eschmechel-v3.pages.dev
// Measures real compressed transfer sizes (what the 14 KB budget is about) and probes the
// Functions without spending AI neurons (only invalid / GET requests are sent to /api/chat).
const BASE = (process.argv[2] ?? 'https://eschmechel-v3.pages.dev').replace(/\/$/, '');
const BUDGET = 14_000;
const results = [];
async function check(name, fn) {
  try {
    const note = await fn();
    results.push(true);
    console.log(`  ok   ${name}${note ? `  (${note})` : ''}`);
  } catch (e) {
    results.push(false);
    console.log(`  FAIL ${name}\n       ${e.message}`);
  }
}
const expect = (c, m) => {
  if (!c) throw new Error(m);
};
const get = (path, init) => fetch(BASE + path, { redirect: 'follow', ...init });

console.log(`remote: ${BASE}`);
for (const [path, id] of [['/', 'whoami'], ['/projects', 'projects'], ['/resume', 'resume'], ['/blog', 'blog'], ['/~', 'home']]) {
  await check(`${path} → ${id} column active`, async () => {
    const res = await get(path);
    const html = await res.text();
    expect(res.ok, `status ${res.status}`);
    expect(new RegExp(`id="col-${id}"[^>]*data-active="true"`).test(html), 'wrong active column');
  });
}

await check('first flight ≤ 14 KB compressed (measured from raw bytes)', async () => {
  const { gzipSync, brotliCompressSync } = await import('node:zlib');
  const sizes = [];
  for (const path of ['/', '/projects', '/~']) {
    const html = Buffer.from(await (await get(path)).text());
    const gz = gzipSync(html, { level: 9 }).length;
    const br = brotliCompressSync(html).length;
    expect(gz <= BUDGET, `${path} gzip ${gz} B`);
    sizes.push(`${path} gz ${gz} / br ${br}`);
  }
  const served = (await get('/', { headers: { 'accept-encoding': 'br, gzip' } })).headers.get('content-encoding');
  return `${sizes.join(' · ')} · served as ${served ?? 'identity'}`;
});

await check('blog post, rss.xml, sitemap, robots.txt, og.png', async () => {
  for (const path of ['/blog/your-ai-slop-bores-me', '/rss.xml', '/sitemap-index.xml', '/robots.txt', '/og.png', '/Elliott-Schmechel-Resume.pdf']) {
    const res = await get(path);
    expect(res.ok, `${path} → ${res.status}`);
  }
});

await check('unknown path → 404 page with status 404', async () => {
  const res = await get('/definitely-not-a-page');
  const html = await res.text();
  expect(res.status === 404, `status ${res.status}`);
  expect(html.includes('no such file or directory'), 'not the custom 404');
});

await check('agent-context.json served with hash', async () => {
  const d = await (await get('/agent-context.json')).json();
  expect(/^[0-9a-f]{16}$/.test(d.hash) && d.suggested?.length === 5, JSON.stringify(d).slice(0, 120));
  return `hash ${d.hash}`;
});

await check('/api/chat: GET → 405, empty POST → 400 or 503 (no neurons spent)', async () => {
  const g = await get('/api/chat');
  expect(g.status === 405, `GET ${g.status}`);
  const p = await get('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"message":""}' });
  const body = await p.json().catch(() => ({}));
  expect([400, 503].includes(p.status), `POST ${p.status} ${JSON.stringify(body)}`);
  return p.status === 503 ? 'agent not configured yet' : 'agent bindings live';
});

await check('/api/status responds', async () => {
  const res = await get('/api/status');
  const d = await res.json();
  expect(res.ok || res.status === 503, `status ${res.status}`);
  return d.configured === false ? 'homelab not configured yet' : d.stale ? 'stale snapshot' : `live: ${d.nodes?.length ?? 0} nodes`;
});

const passed = results.filter(Boolean).length;
console.log(`remote: ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
