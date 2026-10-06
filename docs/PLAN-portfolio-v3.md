# Plan — portfolio v3 (tai-shis-style TUI carousel)

Interview held 2026-10-06 (Q1–Q53). Reference site: https://tai-shis.com/ — labelled-border
panels, horizontally sliding columns with dimmed neighbours, number-key nav, pinned keybind footer.

## Decisions

- **D1** Tai-shis skeleton, freedom to diverge in layout.
- **D2** AI agent kept; boot sequence / CRT / Web Audio / Konami from v2 dropped.
- **D3** Five columns. **D15** Names: `whoami` / `projects` / `resume` / `blog` / `~/`.
- **D4** Astro (vanilla TS islands where interaction is needed — no React).
- **D5** New orphan branch `portfolio-v3`; `portfolio-v2` left as archive. **D52** v2 committed as-is first; v3 built in a `git worktree`.
- **D6** Amber accent.
- **D7** Keep: sliding columns + dimmed neighbours, labelled-border panels, `1–5` + ↑/↓ panel focus, pinned footer with commit hash + keybind hint, ASCII banner. Drop: rotating verb.
- **D8** Agent = `/` command bar in footer **and** an agent panel in `whoami`.
- **D9** `/api/chat` backend is built in this plan.
- **D10** Blog = Astro content collections (MDX) in this repo; `blog.eschmechel.dev` retired.
- **D11** `~/` contents: homelab panel, opinions panel, GitHub heatmap, "now" items. No hobby bars.
- **D12** **Hard rule: no skill ratings, progress bars, levels or stars anywhere.** Tech is plain chips/lists.
- **D13** Project entry = status badge + description + tech chips + links + screenshot thumbnails where available.
- **D14** Original kid + stuffed-tiger homage in the Calvin & Hobbes spirit — never the actual characters, panels or dialogue.
- **D16** Agent model on Cloudflare Workers AI.
- **D17** Guardrails: grounded only in site content; per-IP rate limit; daily neuron budget ("agent's asleep, try `:help`" when exhausted); aggressive caching.
- **D18** Command bar: commands first (`:projects`, `:resume`, `:open <slug>`, `:help`, …), anything else → agent.
- **D19/D20/D41** All content refreshed. Baseline: `~/Downloads/Elliott-Schmechel-Resume-HTN.pdf` (2026-07-09).
- **D21** Cache: KV keyed on normalised question + content hash; build-time pregenerated answers for suggested prompts.
- **D22** IBM Plex Mono. **D23** Dark only at launch.
- **D24** Pages preview builds `portfolio-v3`; launch = switch Pages production branch; `main` stays as v1 archive.
- **D25–D28** Live homelab panel: custom exporter aggregating Proxmox + Prometheus + Uptime Kuma (no k3s) → Cloudflare Tunnel + Access service token → `/api/status`. Public: service up/down + uptime + node CPU/mem/temps; never hostnames/IPs/versions. 60 s cache, last-seen fallback.
- **D29** Langara College, A.Sc. Computer Science, expected May 2027.
- **D30/D36** Roles — current: UNAC-Vancouver Volunteer Fullstack Developer. Past: LicenseSpring, Web Summit Vancouver 2026 (volunteer), Game Tester, Student Software Association. Dropped: AI Red Teamer, Customer Experience.
- **D35/D53** LicenseSpring (Cense Data Inc.) — Technical Content Engineer, Jun–Aug 2026: SDK reference sample apps + integration guides (C++, Go, Python, .NET, Node.js); demo sandbox + licensing-API docs; scripted LicenseSpring University video content. (MicroVM research bullet removed.)
- **D38** Featured projects in order: Heard (StormHacks 2026) · Hermes Apprentice · LearnLM → TutorNexus · DataForAll · Beepd · Homelab. **D39** Archived: Mapd, Unofficial Langara Scheduler. Dropped: ue-p2p-plugin, anticheat-research, 20-games-challenge, french-club.web, DNS Server, ai-redteam, OpenCode Extension Stack.
- **D32** No certifications/awards section; no Dean's Honour Roll. **D40** Wins = one inline chip on the project (e.g. `Winner · Hermes Agent Challenge`).
- **D43** Heard: team of 5, Elliott built the ML/lip-reading pipeline; repo `github.com/LMSAIH/stormhacks2026` (teammate-owned); site tryheard.tech; no award.
- **D44** Mobile: one column, word tabs, swipe, floating `/` button.
- **D45** Banner text `eschmechel`.
- **D46** Animated ASCII tiger companion in the footer reacting to the command bar + one static scene in `~/`.
- **D47** Astro static output + Pages Functions (`/api/chat`, `/api/status`) + KV, one repo / one Pages project.
- **D48** Real routes `/`, `/projects`, `/resume`, `/blog`, `/~` (+ post pages); every route renders the full carousel starting on its column; URL syncs on slide.
- **D49** Cloudflare Web Analytics.
- **D50** Headline: "Systems-focused builder — GPU training infra, self-training agents, real-time edge apps."
- **D51** dev.to articles imported via `npm run sync:devto` (manual) into local MDX. **Q50** eschmechel.dev is canonical; post-launch script sets dev.to `canonical_url` (ask before running).
- **D34** Opinions panel text is the user's; ship "Arch btw" / "self-host everything" as an example stub.

## Assumptions (A1–A10, accepted)

1. Astro latest + TS strict, plain CSS custom properties, no Tailwind, no React.
2. Keys: `1–5` columns, `←/→`/`h/l` columns, `↑/↓`/`j/k` panels, `/`/`:` command bar, `Esc` closes; ignored while typing; `prefers-reduced-motion` disables slide + tiger animation.
3. Workers AI Llama-3.1-8B-class instruct model, 20 msgs/h/IP, daily neuron budget inside free tier (verify current docs).
4. Footer commit hash from `CF_PAGES_COMMIT_SHA` (local: `git rev-parse`).
5. GitHub heatmap built at build time from a public contributions API; daily rebuild via Pages deploy hook on cron.
6. Homelab exporter in Go under `homelab-exporter/`, container on the lab, read-only `PVEAuditor` token, sanitised JSON, aliased host names.
7. Resume column rendered from content; HTN PDF is the download.
8. Screenshots: Heard (captured from tryheard.tech), Hermes (Grafana images from the dev.to post); others text-only until supplied.
9. Every content entry has `verified`; build warns (not fails) while any are false.
10. Later phases: `:theme` / light mode, deeper homelab metrics. `.playwright-mcp/` never committed.

## Phases

1. **Branch setup** — v2 snapshot commit on `portfolio-v2`; worktree `../eschmechel.dev-v3` on orphan `portfolio-v3`; this plan; `AGENTS.md` (+ `CLAUDE.md` symlink); `.gitignore`.
   *Verify:* `git worktree list`; clean v3 tree.
2. **Scaffold** — Astro + TS strict, Plex Mono, `src/styles/tokens.css`, `Panel.astro` (label cut into border), shared `Shell` layout rendering all five columns, five route files, `smoke.sh`.
   *Verify:* `./smoke.sh` → N/N, all routes 200 with correct initial column.
3. **Carousel + keyboard** — vanilla TS island: slide/dim, URL sync, ↑/↓ panel focus, click-to-activate neighbours, mobile tabs + swipe, reduced motion.
   *Verify:* `npm run check:e2e` (Playwright) drives keys/routes/URL sync; screenshots at 1440 and 390 px.
4. **Content** — collections (`projects`, `experience`, `education`, `now`, `opinions`) seeded per D29–D53 with `verified` flags + build warning; screenshots for Heard/Hermes; resume PDF download.
5. **Blog** — `scripts/sync-devto.ts`, post pages, RSS, sitemap, canonical tags.
6. **Command bar + tiger** — commands, agent panel (stubbed), tiger state machine, floating `/` on mobile.
7. **Agent backend** — `content.json` grounding, `functions/api/chat.ts` (Workers AI, KV cache, rate limit, neuron budget), build-time pregenerated answers.
8. **Homelab live** — Go exporter, Dockerfile, cloudflared + Access token, `functions/api/status.ts` with cache + last-seen.
9. **Polish + launch** — heatmap, Web Analytics, OG/meta, a11y pass, preview review, production branch switch (confirm first), dev.to canonical script (confirm first).

## Non-goals

Not touching `main` or `portfolio-v2` beyond the snapshot commit; no light theme at launch; no k3s; no skill levels / hobby bars / certifications section; no Calvin & Hobbes characters; no React.

## Risks / open questions

- Workers AI answer quality — mitigated by tight grounding + pregenerated answers; model swappable.
- Pregenerating answers needs a Cloudflare API token in the Pages build env.
- Homelab exposure is the largest security surface — read-only tokens, Access, sanitised output.
- Heard repo is teammate-owned — frame as "built the ML / lip-reading pipeline".
- Content `verified` flags need the user's pass.
- Content conflict: HTN resume says Langara ends Dec 2026; interview D29 says May 2027 (site uses May 2027).

## Status

- 2026-10-06 — Phases 1–3 done (`1dc1055`). Phase 4 done: content collections, `verified` flags, thumbnails, PDF, figlet-at-build banner.
- 2026-10-06 — Phase 4 polish: lightbox, Devpost/LinkedIn galleries, 14 KB first-flight budget (~11.7 KB/page). Phase 5 done: `npm run sync:devto` (5 posts, images localised as webp), post pages, RSS, sitemap. dev.to `canonical_url` flip still pending (Phase 9, ask first).
- 2026-10-06 — Phase 6 (command bar, ask panel, tiger, ~/ scene), Phase 7 (/api/chat: Workers AI, KV cache, per-IP limit, neuron budget, pregen script) and Phase 8 (Go exporter, /api/status with Access + last-seen, live ~/ panel) done in code and tested locally. Not yet deployed: needs KV id, Cloudflare login, tunnel + Access token (docs/DEPLOY.md).
- 2026-10-06 — Stage 1 content pass done (Mapd featured with results; 2 entries left unverified: homelab, langara-scheduler). Stage 6: AA contrast (--fg-dim), page <h1>s, 404, robots.txt, OG card, GitHub heatmap; Lighthouse 100/100/100/100 desktop + mobile. New Pages project `eschmechel-v3` (Q1=A); v2 branch to be deleted once v3 preview verified (Q2).
