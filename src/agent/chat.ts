// /api/chat logic, kept free of Pages types so it runs (and is tested) under plain Node.
// functions/api/chat.ts wires it to the real bindings.
//
// Order: pregenerated answer → KV answer cache → per-IP hourly limit → daily neuron budget → model.
// Cache hits are free and never count against limits (D17, D21).

import { MAX_ANSWER_TOKENS, MAX_QUESTION_CHARS, MODEL, estimateNeurons, normalizeQuestion, sha256Hex, systemPrompt } from './core.ts';

export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}
export interface AILike {
  run(model: string, input: unknown): Promise<unknown>;
}
export interface ChatEnv {
  AI?: AILike;
  AGENT_KV?: KVLike;
  AGENT_HOURLY_LIMIT?: string;
  AGENT_DAILY_NEURONS?: string;
}
export interface AgentContext {
  hash: string;
  text: string;
  suggested: { q: string; a?: string }[];
}

type Source = 'pregen' | 'cache' | 'model';

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const answer = (text: string, source: Source) => json(200, { answer: text, source });

const HOUR = 3600;
const DAY = 86_400;

interface ModelResult {
  response?: string;
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export async function handleChat(
  request: Request,
  env: ChatEnv,
  loadContext: () => Promise<AgentContext>,
  now: Date = new Date(),
): Promise<Response> {
  if (request.method !== 'POST') return json(405, { error: 'POST only' });
  if (!env.AI || !env.AGENT_KV) return json(503, { error: 'the agent is not configured on this deployment.' });
  const kv = env.AGENT_KV;

  let message = '';
  try {
    const body = (await request.json()) as { message?: unknown };
    message = typeof body.message === 'string' ? body.message.trim() : '';
  } catch {
    return json(400, { error: 'send JSON: { "message": "…" }' });
  }
  if (!message) return json(400, { error: 'ask something!' });
  if (message.length > MAX_QUESTION_CHARS) return json(400, { error: `keep it under ${MAX_QUESTION_CHARS} characters.` });

  const ctx = await loadContext();
  const key = normalizeQuestion(message);

  const pregen = ctx.suggested.find((s) => s.a && normalizeQuestion(s.q) === key);
  if (pregen?.a) return answer(pregen.a, 'pregen');

  const cacheKey = `ans:${ctx.hash}:${(await sha256Hex(key)).slice(0, 32)}`;
  const cached = await kv.get(cacheKey);
  if (cached) return answer(cached, 'cache');

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const hourKey = `rl:${ip}:${now.toISOString().slice(0, 13)}`;
  const used = Number((await kv.get(hourKey)) ?? 0);
  if (used >= Number(env.AGENT_HOURLY_LIMIT ?? 20)) {
    return json(429, { error: "that's a lot of questions — give it an hour, or email elliottschmechel@gmail.com." });
  }

  const budgetKey = `budget:${now.toISOString().slice(0, 10)}`;
  const spent = Number((await kv.get(budgetKey)) ?? 0);
  if (spent >= Number(env.AGENT_DAILY_NEURONS ?? 9000)) {
    return json(503, { error: "the agent's asleep for today — try :help, or email elliottschmechel@gmail.com." });
  }

  const messages = [
    { role: 'system', content: systemPrompt(ctx.text) },
    { role: 'user', content: message },
  ];
  let result: ModelResult;
  try {
    result = (await env.AI.run(MODEL, { messages, max_tokens: MAX_ANSWER_TOKENS, temperature: 0.3 })) as ModelResult;
  } catch {
    return json(502, { error: 'the model hiccuped — try again in a moment.' });
  }
  const text = (result.response ?? result.choices?.[0]?.message?.content ?? '').trim();
  if (!text) return json(502, { error: 'the model returned nothing — try rephrasing.' });

  // Prefer real token counts; fall back to ~4 chars per token.
  const promptChars = messages.reduce((n, m) => n + m.content.length, 0);
  const neurons = estimateNeurons(
    result.usage?.prompt_tokens ?? Math.ceil(promptChars / 4),
    result.usage?.completion_tokens ?? Math.ceil(text.length / 4),
  );

  await Promise.all([
    kv.put(cacheKey, text, { expirationTtl: 7 * DAY }),
    kv.put(hourKey, String(used + 1), { expirationTtl: HOUR + 60 }),
    kv.put(budgetKey, String(spent + neurons), { expirationTtl: 2 * DAY }),
  ]);
  return answer(text, 'model');
}
