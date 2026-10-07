// Pregenerate answers for the suggested prompts (D21) so the one-click questions cost nothing at
// runtime. Uses the same model + system prompt as /api/chat, via the Workers AI REST API.
//
//   npm run build && npm run agent:pregen && npm run build
//
// Needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (Workers AI: Read). Without them it exits 0
// and leaves src/data/agent-answers.json untouched. Answers are pinned to the content hash, so
// editing site content silently retires them until this is re-run.

import { readFileSync, writeFileSync } from 'node:fs';
import { MAX_ANSWER_TOKENS, MODEL, SUGGESTED, systemPrompt } from '../src/agent/core.ts';

const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_API_TOKEN: token } = process.env;
if (!account || !token) {
  console.log('agent:pregen — CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN not set; skipping (runtime will answer + cache instead).');
  process.exit(0);
}

const ctx = JSON.parse(readFileSync('dist/agent-context.json', 'utf8')) as { hash: string; text: string };
const existing = JSON.parse(readFileSync('src/data/agent-answers.json', 'utf8')) as { hash: string; answers: Record<string, string> };
if (existing.hash === ctx.hash && SUGGESTED.every((q) => existing.answers[q])) {
  console.log(`agent:pregen — answers already pinned to content hash ${ctx.hash}; nothing to do.`);
  process.exit(0);
}
const answers: Record<string, string> = {};

for (const q of SUGGESTED) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt(ctx.text) },
        { role: 'user', content: q },
      ],
      max_tokens: MAX_ANSWER_TOKENS,
      temperature: 0.3,
    }),
  });
  const data = (await res.json()) as { success: boolean; result?: { response?: string }; errors?: unknown };
  const text = data.result?.response?.trim();
  if (!res.ok || !data.success || !text) throw new Error(`Workers AI failed for "${q}": ${res.status} ${JSON.stringify(data.errors)}`);
  answers[q] = text;
  console.log(`  + ${q}\n    ${text.slice(0, 100)}${text.length > 100 ? '…' : ''}`);
}

writeFileSync(
  'src/data/agent-answers.json',
  JSON.stringify({ hash: ctx.hash, model: MODEL, generatedAt: new Date().toISOString(), answers }, null, 2) + '\n',
);
console.log(`agent:pregen — ${Object.keys(answers).length} answers pinned to content hash ${ctx.hash}. Rebuild to ship them.`);
