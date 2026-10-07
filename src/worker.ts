// Worker entry (D47, Workers flavour — Q5). Static files in dist/ are served directly by Workers
// static assets; wrangler.toml's run_worker_first sends only /api/* here.
import { handleChat, type AgentContext, type ChatEnv } from './agent/chat.ts';
import { handleStatus, type StatusEnv } from './homelab/status.ts';

interface Env extends ChatEnv, StatusEnv {
  ASSETS: { fetch(input: Request | string | URL, init?: RequestInit): Promise<Response> };
}

let context: Promise<AgentContext> | undefined; // per-isolate; a deploy brings a fresh isolate + new hash

const offline = () => Response.json({ error: 'agent offline right now.' }, { status: 503, headers: { 'cache-control': 'no-store' } });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/chat') {
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
        return offline();
      }
    }
    if (pathname === '/api/status') return handleStatus(request, env);
    if (pathname.startsWith('/api/')) return Response.json({ error: 'not found' }, { status: 404 });

    return env.ASSETS.fetch(request);
  },
};
