// POST /api/chat — the portfolio agent (D9, D16, D17). Logic lives in src/agent/chat.ts.
import { handleChat, type AgentContext, type ChatEnv } from '../../src/agent/chat.ts';

interface Env extends ChatEnv {
  ASSETS: { fetch(input: Request | string | URL): Promise<Response> };
}

let context: Promise<AgentContext> | undefined; // per-isolate; a deploy brings a fresh isolate + new hash

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  const load = () =>
    (context ??= env.ASSETS.fetch(new URL('/agent-context.json', request.url)).then((r) => {
      if (!r.ok) {
        context = undefined;
        throw new Error(`agent-context.json ${r.status}`);
      }
      return r.json() as Promise<AgentContext>;
    }));
  try {
    return await handleChat(request, env, load);
  } catch {
    return Response.json({ error: 'agent offline right now.' }, { status: 503, headers: { 'cache-control': 'no-store' } });
  }
};
