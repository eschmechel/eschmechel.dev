# Deploy runbook — eschmechel.dev v3

Static Astro site served by a **Cloudflare Worker** (`eschmechel-v3`): Workers static assets serve
`dist/`, and `src/worker.ts` handles only `/api/*`. The live v1 site stays on the Pages project
`eschmechel-dev` until launch.

## 1. Worker + Workers Builds (Q5)

- Dashboard: Workers & Pages → `eschmechel-v3` → Settings → Build: repo `eschmechel/eschmechel.dev`,
  branch `portfolio-v3`, build `npm run build`, deploy `npx wrangler deploy`, root `/`, `NODE_VERSION=22`.
- Every push to `portfolio-v3` builds + deploys to `eschmechel-v3.<subdomain>.workers.dev`.
- Manual deploy from a checkout: `npm run build && npx wrangler deploy`.
- Verify any deployment: `node tests/remote.check.mjs <url>` (spends no AI neurons).
- The old Pages project builds previews of every pushed branch; set its Branch control → Preview
  branches to *None* so `portfolio-v3` pushes don't create failing previews there.

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

1. Run the exporter on the lab, listening on `127.0.0.1:9477` only.
2. Cloudflare Tunnel: `cloudflared tunnel create lab-status`, route `status.lab.eschmechel.dev` →
   `http://127.0.0.1:9477`.
3. Zero Trust → Access → Applications → self-hosted app for `status.lab.eschmechel.dev`, policy
   **Service Auth** only. Create a **service token** for it.
4. Give the token to the Worker and point it at the tunnel:

   ```sh
   npx wrangler secret put HOMELAB_ACCESS_CLIENT_ID
   npx wrangler secret put HOMELAB_ACCESS_CLIENT_SECRET
   # wrangler.toml [vars]: HOMELAB_STATUS_URL = "https://status.lab.eschmechel.dev/status"
   ```

Until those are set, the `~/` homelab panel shows "not wired up yet" rather than erroring.

## 4. Daily rebuild (keeps the GitHub heatmap fresh)

1. Worker → Settings → Build → **Deploy hooks** (or a Cloudflare API token + `wrangler deploy` in Actions).
2. GitHub repo → Settings → Secrets → Actions → `PAGES_DEPLOY_HOOK` = that URL.
3. `.github/workflows/daily-rebuild.yml` then pings it at 09:17 UTC. **GitHub only runs scheduled
   workflows from the default branch**, so this starts working once `portfolio-v3` is the repo's
   default branch (or the workflow file is copied to `main`) — decide at launch.

## 5. After launch (Phase 9 — ask first)

- Flip dev.to `canonical_url` on each imported post to `https://eschmechel.dev/blog/<slug>`.
- Cloudflare Web Analytics (D49).
