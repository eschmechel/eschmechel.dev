# AGENTS.md — eschmechel.dev (portfolio v3)

Personal portfolio for Elliott Schmechel. TUI-style horizontal carousel of labelled panels,
modelled loosely on https://tai-shis.com/. The full plan and every decision (D1–D53) live in
[`docs/PLAN-portfolio-v3.md`](docs/PLAN-portfolio-v3.md) — read it before changing behaviour.

## Stack

- Astro (static output) + TypeScript strict. Plain CSS custom properties in `src/styles/tokens.css`.
- Interactivity is vanilla TS (`<script>` in `.astro` files). **No React, no Tailwind.**
- Cloudflare Pages Functions in `functions/api/*` are thin wrappers; their logic lives in
  `src/agent/chat.ts` and `src/homelab/status.ts` so it runs under plain Node in tests.
  Bindings + limits: `wrangler.toml`. Deploy steps: `docs/DEPLOY.md`.
- Go homelab exporter in `homelab-exporter/` (own README, `go test ./...`).

## Layout

- `src/layouts/Shell.astro` renders nav, all five columns and the footer on every route.
- `src/pages/{index,projects,resume,blog,~}` only choose the initial column.
- `src/components/columns/*` — one component per column; `src/components/Panel.astro` — bordered panel with a label in the top border.
- `src/scripts/carousel.ts` — column switching, panel focus, URL sync, swipe. Other islands talk to it
  with `carousel:go` ({col, panel?}) and listen for `carousel:changed` ({col}).
- `src/scripts/cmdbar.ts` — `/` command bar, agent client, tiger companion. `src/agent/core.ts` holds
  the model id, neuron prices, suggested prompts and the system prompt (shared with the function).
- `src/content/*` — all copy; `src/pages/agent-context.json.ts` turns it into the agent's grounding.
- `src/content/blog/*` — imported by `npm run sync:devto` (never overwrites without `--force`).

## Hard rules

0. **First load ≤ 14 KB gzipped** per page (`tests/budget.check.mjs`); CSS is inlined, JS is deferred modules.
1. **No skill ratings, progress bars, levels or stars** for skills/tech — plain chips and lists only.
2. **No Calvin & Hobbes characters, panels or dialogue.** Kid-and-tiger art must be original.
3. No certifications/awards section; a win is one inline chip on its project.
4. Content must be factual — never invent metrics. Unconfirmed entries carry `verified: false`.
5. Keyboard shortcuts must never fire while focus is in an input/textarea/contenteditable.
6. Respect `prefers-reduced-motion`.

## Commands

- `npm run dev` — dev server
- `npm run build` — `astro check` + build
- `./smoke.sh` — standing gate: build + route checks. Run after every product change; report `smoke: N/N`.
- `npm run check:e2e` — Playwright (system Chrome): keys, routes, cmd bar, agent (mocked), lightbox,
  blog, homelab panel (mocked), screenshots (1440 / 390) into `.artifacts/`.
- `npm run check:api` — /api/chat + /api/status logic with fake AI / KV / fetch.
- `npm run sync:devto` — import new dev.to posts. `npm run agent:pregen` — needs Cloudflare creds.

## Git

Commits are signed via 1Password; if the agent socket is unavailable, stop and ask rather than disabling signing.
