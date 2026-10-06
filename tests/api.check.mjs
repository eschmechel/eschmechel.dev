// Unit checks for the Pages Function logic with in-memory KV + a fake Workers AI binding.
// No network, no Cloudflare account. Run: node tests/api.check.mjs
import { readFileSync } from 'node:fs';
import { handleChat } from '../src/agent/chat.ts';
import { estimateNeurons } from '../src/agent/core.ts';

const ctxFile = JSON.parse(readFileSync('dist/agent-context.json', 'utf8'));
const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push(true);
    console.log(`  ok   ${name}`);
  } catch (e) {
    results.push(false);
    console.log(`  FAIL ${name}\n       ${e.message}`);
  }
}
const expect = (c, m) => {
  if (!c) throw new Error(m);
};

function memoryKV() {
  const m = new Map();
  return { m, get: async (k) => m.get(k) ?? null, put: async (k, v) => void m.set(k, v) };
}
function fakeAI(reply = { response: 'Elliott is building v3 of his site.', usage: { prompt_tokens: 2000, completion_tokens: 100 } }) {
  const calls = [];
  return { calls, run: async (model, input) => (calls.push({ model, input }), typeof reply === 'function' ? reply() : reply) };
}
const req = (message, ip = '1.1.1.1', method = 'POST') =>
  new Request('https://eschmechel.dev/api/chat', {
    method,
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip },
    body: method === 'POST' ? JSON.stringify({ message }) : undefined,
  });
const ctx = (suggested = ctxFile.suggested) => async () => ({ ...ctxFile, suggested });
const body = async (r) => ({ status: r.status, ...(await r.json()) });
const NOW = new Date('2026-10-06T18:30:00Z');

await check('agent-context.json: hash + grounding text + 5 suggestions', async () => {
  expect(/^[0-9a-f]{16}$/.test(ctxFile.hash), ctxFile.hash);
  expect(ctxFile.text.includes('hermes-apprentice') && ctxFile.text.includes('LicenseSpring'), 'text missing content');
  expect(ctxFile.suggested.length === 5, 'suggested');
});

await check('GET → 405; missing bindings → 503', async () => {
  expect((await handleChat(req('', undefined, 'GET'), {}, ctx())).status === 405, 'GET');
  expect((await handleChat(req('hi'), { AGENT_KV: memoryKV() }, ctx())).status === 503, 'no AI');
});

await check('empty / oversized / non-JSON → 400', async () => {
  const env = { AI: fakeAI(), AGENT_KV: memoryKV() };
  expect((await handleChat(req('   '), env, ctx())).status === 400, 'empty');
  expect((await handleChat(req('x'.repeat(501)), env, ctx())).status === 400, 'long');
  const bad = new Request('https://x/api/chat', { method: 'POST', body: 'nope' });
  expect((await handleChat(bad, env, ctx())).status === 400, 'non-json');
  expect(env.AI.calls.length === 0, 'model called on bad input');
});

await check('model answer: grounded system prompt, cached, rate + budget recorded', async () => {
  const env = { AI: fakeAI(), AGENT_KV: memoryKV() };
  const r = await body(await handleChat(req('What is he building?'), env, ctx(), NOW));
  expect(r.status === 200 && r.source === 'model' && r.answer.startsWith('Elliott'), JSON.stringify(r));
  const [{ model, input }] = env.AI.calls;
  expect(model === '@cf/meta/llama-3.1-8b-instruct-fp8-fast', model);
  expect(input.messages[0].content.includes('<site>') && input.messages[0].content.includes('hermes-apprentice'), 'not grounded');
  expect(input.messages[1].content === 'What is he building?', 'user message');
  const kv = env.AGENT_KV.m;
  expect([...kv.keys()].some((k) => k.startsWith(`ans:${ctxFile.hash}:`)), 'answer not cached');
  expect(kv.get('rl:1.1.1.1:2026-10-06T18') === '1', 'rate counter');
  const spent = Number(kv.get('budget:2026-10-06'));
  expect(Math.abs(spent - estimateNeurons(2000, 100)) < 1e-9, `budget ${spent}`);
});

await check('same question, different case/punctuation → cache hit, no model call', async () => {
  const env = { AI: fakeAI(), AGENT_KV: memoryKV() };
  await handleChat(req('What is he building?'), env, ctx(), NOW);
  const r = await body(await handleChat(req('  what IS he building!! '), env, ctx(), NOW));
  expect(r.source === 'cache' && env.AI.calls.length === 1, JSON.stringify(r));
});

await check('pregenerated suggestion answers cost nothing', async () => {
  const env = { AI: fakeAI(), AGENT_KV: memoryKV() };
  const r = await body(await handleChat(req('tell me about heard'), env, ctx([{ q: 'Tell me about Heard.', a: 'Heard lip-reads.' }]), NOW));
  expect(r.source === 'pregen' && r.answer === 'Heard lip-reads.' && env.AI.calls.length === 0, JSON.stringify(r));
});

await check('per-IP hourly limit → 429, other IPs unaffected, resets next hour', async () => {
  const env = { AI: fakeAI(), AGENT_KV: memoryKV(), AGENT_HOURLY_LIMIT: '2' };
  await handleChat(req('q one'), env, ctx(), NOW);
  await handleChat(req('q two'), env, ctx(), NOW);
  expect((await handleChat(req('q three'), env, ctx(), NOW)).status === 429, 'third should be limited');
  expect((await handleChat(req('q three', '2.2.2.2'), env, ctx(), NOW)).status === 200, 'other IP blocked');
  expect((await handleChat(req('q three'), env, ctx(), new Date('2026-10-06T19:01:00Z'))).status === 200, 'no reset');
  expect((await body(await handleChat(req('q one'), env, ctx(), NOW))).source === 'cache', 'cached answers should bypass the limit');
});

await check('daily neuron budget exhausted → 503 asleep, model not called', async () => {
  const kv = memoryKV();
  kv.m.set('budget:2026-10-06', '9000');
  const env = { AI: fakeAI(), AGENT_KV: kv };
  const r = await body(await handleChat(req('anything new?'), env, ctx(), NOW));
  expect(r.status === 503 && r.error.includes('asleep') && env.AI.calls.length === 0, JSON.stringify(r));
});

await check('model failure → 502, nothing cached or charged', async () => {
  const env = {
    AI: fakeAI(() => {
      throw new Error('boom');
    }),
    AGENT_KV: memoryKV(),
  };
  expect((await handleChat(req('hello'), env, ctx(), NOW)).status === 502, 'status');
  expect(env.AGENT_KV.m.size === 0, 'wrote to KV after failure');
});

await check('OpenAI-style responses ({ choices }) are understood', async () => {
  const env = { AI: fakeAI({ choices: [{ message: { content: ' hi there ' } }] }), AGENT_KV: memoryKV() };
  const r = await body(await handleChat(req('hey'), env, ctx(), NOW));
  expect(r.answer === 'hi there', JSON.stringify(r));
});

// ── /api/status ────────────────────────────────────────────────────────
const { handleStatus, sanitize } = await import('../src/homelab/status.ts');
const LAB = {
  generatedAt: '2026-10-06T18:29:50Z',
  nodes: [{ name: 'atlas', online: true, cpuPct: 12.3, memPct: 25, tempC: 47.3, uptimeS: 360000, guestsRunning: 2 }],
  services: [{ name: 'Jellyfin', up: true, uptime24hPct: 99.9 }],
  sources: { proxmox: 'ok' },
};
const statusEnv = (extra = {}) => ({ HOMELAB_STATUS_URL: 'https://status.lab.example/status', HOMELAB_ACCESS_CLIENT_ID: 'id', HOMELAB_ACCESS_CLIENT_SECRET: 'sec', AGENT_KV: memoryKV(), ...extra });
const getReq = new Request('https://eschmechel.dev/api/status');
function fakeFetch(payload = LAB, status = 200) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, headers: init?.headers });
    if (payload === 'throw') throw new Error('down');
    return new Response(JSON.stringify(payload), { status });
  };
  fn.calls = calls;
  return fn;
}

await check('status: not configured → 200 {configured:false}, no fetch', async () => {
  const f = fakeFetch();
  const r = await body(await handleStatus(getReq, {}, f, NOW));
  expect(r.status === 200 && r.configured === false && f.calls.length === 0, JSON.stringify(r));
});

await check('status: fetches through Access with service-token headers', async () => {
  const f = fakeFetch();
  const r = await body(await handleStatus(getReq, statusEnv(), f, NOW));
  expect(r.configured && !r.stale && r.nodes[0].name === 'atlas' && r.services[0].up, JSON.stringify(r));
  expect(f.calls[0].headers['CF-Access-Client-Id'] === 'id' && f.calls[0].headers['CF-Access-Client-Secret'] === 'sec', 'access headers');
  expect(!('sources' in r), 'unexpected field passed through');
});

await check('status: fresh for 60 s from KV, then refetched', async () => {
  const env = statusEnv();
  const f = fakeFetch();
  await handleStatus(getReq, env, f, NOW);
  await handleStatus(getReq, env, f, new Date(NOW.getTime() + 30_000));
  expect(f.calls.length === 1, `cached: ${f.calls.length}`);
  await handleStatus(getReq, env, f, new Date(NOW.getTime() + 61_000));
  expect(f.calls.length === 2, `refetch: ${f.calls.length}`);
});

await check('status: lab down → last-seen snapshot marked stale; nothing ever → 503', async () => {
  const env = statusEnv();
  await handleStatus(getReq, env, fakeFetch(), NOW);
  const later = new Date(NOW.getTime() + 3_600_000);
  const r = await body(await handleStatus(getReq, env, fakeFetch('throw'), later));
  expect(r.status === 200 && r.stale === true && r.fetchedAt === NOW.toISOString() && r.nodes.length === 1, JSON.stringify(r));
  const cold = await handleStatus(getReq, statusEnv(), fakeFetch({}, 502), NOW);
  expect(cold.status === 503, `cold failure ${cold.status}`);
});

await check('status: allow-list scrubs hostile exporter output', async () => {
  const s = sanitize({
    generatedAt: 'not a date',
    nodes: [{ name: '192.168.1.5', online: 'yes', cpuPct: 900, memPct: -4, tempC: 'hot', uptimeS: 1.9, guestsRunning: 2, ip: '10.0.0.1' }],
    services: [{ name: 'https://git.home.lan', up: true, uptime24hPct: 250, version: '1.2.3' }, { name: 'grafana.lab.example.com', up: false }],
    hostname: 'secret-box',
  });
  const out = JSON.stringify(s);
  for (const leak of ['192.168', '10.0.0.1', 'git.home', 'grafana.lab', 'secret-box', '1.2.3']) expect(!out.includes(leak), `leaked ${leak}: ${out}`);
  expect(s.nodes[0].name === 'node-1' && s.nodes[0].online === false && s.nodes[0].cpuPct === 100 && s.nodes[0].memPct === 0 && s.nodes[0].tempC === null, out);
  expect(s.services[0].name === 'service-1' && s.services[0].uptime24hPct === 100 && s.services[1].name === 'service-2', out);
});

await check('status: POST → 405', async () => {
  const r = await handleStatus(new Request('https://x/api/status', { method: 'POST' }), statusEnv(), fakeFetch(), NOW);
  expect(r.status === 405, String(r.status));
});

const passed = results.filter(Boolean).length;
console.log(`api: ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
