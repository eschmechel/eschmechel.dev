// /api/status logic (D25–D28), free of Pages types so it is tested under plain Node.
// Fetches the lab exporter through Cloudflare Access, caches 60 s in KV, falls back to the
// last-seen snapshot, and re-applies an allow-list so nothing but coarse health ever ships.

import type { KVLike } from '../agent/chat.ts';

export interface StatusEnv {
  AGENT_KV?: KVLike; // shared namespace; homelab keys are prefixed `homelab:`
  HOMELAB_STATUS_URL?: string;
  HOMELAB_ACCESS_CLIENT_ID?: string;
  HOMELAB_ACCESS_CLIENT_SECRET?: string;
}

export interface PublicNode {
  name: string;
  online: boolean;
  cpuPct: number;
  memPct: number;
  tempC: number | null;
  uptimeS: number;
  guestsRunning: number;
}
export interface PublicService {
  name: string;
  up: boolean;
  uptime24hPct: number | null;
}
export interface PublicStatus {
  generatedAt: string;
  nodes: PublicNode[];
  services: PublicService[];
}

const FRESH_MS = 60_000;
const LAST_KEY = 'homelab:last';

const ADDRESSY = /\b\d{1,3}(\.\d{1,3}){3}\b|[0-9a-f]{1,4}(:[0-9a-f]{0,4}){2,}|[a-z][a-z0-9+.-]*:\/\/|\.(lan|local|home|internal|corp|arpa)\b|\b[a-z0-9-]+\.[a-z0-9-]+\.[a-z]{2,}\b/i;
const name = (v: unknown, max: number, fallback: string) => {
  const s = typeof v === 'string' ? v.replace(/[^\p{L}\p{N} ._+-]/gu, '').trim().slice(0, max) : '';
  return !s || ADDRESSY.test(String(v)) ? fallback : s;
};
const num = (v: unknown, lo: number, hi: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);
const numOrNull = (v: unknown, lo: number, hi: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : null);

/** Allow-list: rebuild the payload field by field; anything unexpected is dropped. */
export function sanitize(raw: unknown): PublicStatus {
  const r = (raw ?? {}) as Record<string, unknown>;
  const nodes = Array.isArray(r.nodes) ? r.nodes.slice(0, 12) : [];
  const services = Array.isArray(r.services) ? r.services.slice(0, 24) : [];
  const generated = typeof r.generatedAt === 'string' && !Number.isNaN(Date.parse(r.generatedAt)) ? new Date(r.generatedAt).toISOString() : new Date(0).toISOString();
  return {
    generatedAt: generated,
    nodes: nodes.map((n: Record<string, unknown>, i) => ({
      name: name(n?.name, 24, `node-${i + 1}`),
      online: n?.online === true,
      cpuPct: Math.round(num(n?.cpuPct, 0, 100) * 10) / 10,
      memPct: Math.round(num(n?.memPct, 0, 100) * 10) / 10,
      tempC: numOrNull(n?.tempC, -40, 150),
      uptimeS: Math.floor(num(n?.uptimeS, 0, 10 * 365 * 86_400)),
      guestsRunning: Math.floor(num(n?.guestsRunning, 0, 999)),
    })),
    services: services.map((s: Record<string, unknown>, i) => ({
      name: name(s?.name, 40, `service-${i + 1}`),
      up: s?.up === true,
      uptime24hPct: numOrNull(s?.uptime24hPct, 0, 100),
    })),
  };
}

const json = (status: number, body: unknown, maxAge = 30) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${maxAge}` },
  });

export async function handleStatus(
  request: Request,
  env: StatusEnv,
  fetchFn: typeof fetch = fetch,
  now: Date = new Date(),
): Promise<Response> {
  if (request.method !== 'GET') return json(405, { error: 'GET only' }, 0);
  if (!env.HOMELAB_STATUS_URL) return json(200, { configured: false });

  const kv = env.AGENT_KV;
  const last = kv ? ((await kv.get(LAST_KEY)) ?? null) : null;
  const lastSeen = last ? (JSON.parse(last) as { fetchedAt: string; status: PublicStatus }) : null;
  if (lastSeen && now.getTime() - Date.parse(lastSeen.fetchedAt) < FRESH_MS) {
    return json(200, { configured: true, stale: false, fetchedAt: lastSeen.fetchedAt, ...lastSeen.status });
  }

  try {
    const res = await fetchFn(env.HOMELAB_STATUS_URL, {
      headers: {
        'CF-Access-Client-Id': env.HOMELAB_ACCESS_CLIENT_ID ?? '',
        'CF-Access-Client-Secret': env.HOMELAB_ACCESS_CLIENT_SECRET ?? '',
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const status = sanitize(await res.json());
    const fetchedAt = now.toISOString();
    await kv?.put(LAST_KEY, JSON.stringify({ fetchedAt, status }), { expirationTtl: 30 * 86_400 });
    return json(200, { configured: true, stale: false, fetchedAt, ...status });
  } catch {
    if (lastSeen) return json(200, { configured: true, stale: true, fetchedAt: lastSeen.fetchedAt, ...lastSeen.status });
    return json(503, { configured: true, error: 'lab unreachable' }, 15);
  }
}
