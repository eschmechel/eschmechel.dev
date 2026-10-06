# AGENTS.md — eschmechel.dev (portfolio v3)

Personal portfolio for Elliott Schmechel. TUI-style horizontal carousel of labelled panels,
modelled loosely on https://tai-shis.com/. The full plan and every decision (D1–D53) live in
[`docs/PLAN-portfolio-v3.md`](docs/PLAN-portfolio-v3.md) — read it before changing behaviour.

## Stack

- Astro (static output) + TypeScript strict. Plain CSS custom properties in `src/styles/tokens.css`.
- Interactivity is vanilla TS (`<script>` in `.astro` files). **No React, no Tailwind.**
- Later phases: Cloudflare Pages Functions in `functions/api/*` + KV; Go homelab exporter in `homelab-exporter/`.

## Layout

- `src/layouts/Shell.astro` renders nav, all five columns and the footer on every route.
- `src/pages/{index,projects,resume,blog,~}` only choose the initial column.
- `src/components/columns/*` — one component per column; `src/components/Panel.astro` — bordered panel with a label in the top border.
- `src/scripts/carousel.ts` — column switching, panel focus, URL sync, swipe.

## Hard rules

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
- `npm run check:e2e` — Playwright: keys, routes, URL sync, screenshots (1440 / 390) into `.artifacts/`.

## Git

Commits are signed via 1Password; if the agent socket is unavailable, stop and ask rather than disabling signing.
