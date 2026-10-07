# Deploy runbook — eschmechel.dev v3

Static Astro site served by a **Cloudflare Worker** (`eschmechel-v3`) on eschmechel.dev + www:
Workers static assets serve `dist/`, and `src/worker.ts` handles only `/api/*`. Branch `main` is v3;
v1 lives on as the `v1-archive` branch (its old Pages project was deleted at launch).

## 1. Worker + Workers Builds (Q5)

- Dashboard: Workers & Pages → `eschmechel-v3` → Settings → Build: repo `eschmechel/eschmechel.dev`,
  branch `main`, build `npm run build`, deploy `npx wrangler deploy`, root `/`, `NODE_VERSION=22`.
- Every push to `main` builds + deploys to eschmechel.dev (custom domains are `routes` in wrangler.toml).
- Manual deploy from a checkout: `npm run build && npx wrangler deploy`.
- Verify any deployment: `node tests/remote.check.mjs https://eschmechel.dev` (spends no AI neurons).

## 2. Agent (/api/chat) — Phase 7

```sh
npx wrangler login
npx wrangler kv namespace create AGENT_KV       # paste the id into wrangler.toml
```

- `[ai] binding = "AI"` is already declared — no setup beyond the account having Workers AI.
- Limits live in `wrangler.toml [vars]`: `AGENT_HOURLY_LIMIT` (20/IP/h) and `AGENT_DAILY_NEURONS`
  (9000/day; Workers AI's free allocation is 10,000 neurons/day, resetting 00:00 UTC). One fresh
  answer costs ~18 neurons with the current ~2k-token context, so ~500 fresh answers/day; cached and
  pregenerated answers are free.
- Optional pregenerated answers for the five suggested prompts (create an API token with
  *Workers AI: Read*):

  ```sh
  export CLOUDFLARE_ACCOUNT_ID=…  CLOUDFLARE_API_TOKEN=…
  npm run build && npm run agent:pregen && npm run build   # commit src/data/agent-answers.json
  ```

  Answers are pinned to the content hash; editing content retires them until you re-run this.
- Hard spend cap (D17): the neuron budget stops model calls at 9000/day. If the account is on
  Workers Paid, also set a billing notification in the dashboard as a belt-and-braces alert.

Local check without an account: `npm run check:api` (mock AI + KV). `npx wrangler dev` runs the
real Workers runtime locally (the AI binding is always remote, so real questions cost neurons).

## 3. Homelab status (/api/status) — Phase 8

See [`homelab-exporter/README.md`](../homelab-exporter/README.md) for the exporter itself. Then:

Hostname is `lab-status.eschmechel.dev` — one level deep, so the free Universal SSL cert covers it
(`status.lab.eschmechel.dev` would need Advanced Certificate Manager).

1. Proxmox: a read-only `PVEAuditor` API token (exporter README, "Proxmox token").
2. Zero Trust → Networks → Tunnels → **Create** (cloudflared) `homelab-status`, environment Docker;
   copy the token into the exporter's `.env` as `TUNNEL_TOKEN`. Public hostname:
   `lab-status.eschmechel.dev` → service `HTTP` · `exporter:9477`.
3. On the Docker host, in `homelab-exporter/`: fill `.env`, then `docker compose up -d --build`.
   The tunnel shows **Healthy** in the dashboard once cloudflared connects.
4. Zero Trust → Access → **Service credentials** → create service token `eschmechel-site` (copy the
   ID + secret — shown once). Then Access → Applications → **self-hosted** app for
   `lab-status.eschmechel.dev`, one policy, action **Service Auth**, include that service token.
5. Give the token to the Worker and point it at the tunnel:

   ```sh
   npx wrangler secret put HOMELAB_ACCESS_CLIENT_ID
   npx wrangler secret put HOMELAB_ACCESS_CLIENT_SECRET
   # wrangler.toml [vars]: HOMELAB_STATUS_URL = "https://lab-status.eschmechel.dev/status"
   ```

Until those are set, the `~/` homelab panel shows "not wired up yet" rather than erroring.

## 4. Daily deploy (heatmap + pregenerated agent answers)

`.github/workflows/daily-deploy.yml` runs at 09:17 UTC (scheduled workflows only run from the default
branch, `main`): build → `agent:pregen` (no-op unless content changed) → `smoke.sh` → `wrangler deploy`.

- Repo secret `CLOUDFLARE_API_TOKEN`: "Edit Cloudflare Workers" template + Account › Workers AI › Read.
- Run it on demand: Actions → daily deploy → Run workflow.

## 5. After launch (Phase 9 — ask first)

- dev.to `canonical_url` → eschmechel.dev: done 2026-10-07; for newly imported posts run
  `npm run devto:canonical` (dry run) then `-- --apply` (needs `DEVTO_API_KEY` in `.env`).
- Cloudflare Web Analytics (D49).
