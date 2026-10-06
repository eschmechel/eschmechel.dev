# homelab-exporter

Publishes a **sanitised** health snapshot of the lab for the `~/` panel on eschmechel.dev (D25–D28).

```
Proxmox ─┐
Prometheus ─┼─> homelab-exporter :9477/status ─> cloudflared ─> Cloudflare Access (service token) ─> /api/status (Pages) ─> ~/
Uptime Kuma ─┘
```

## What leaves the lab

```json
{
  "generatedAt": "2026-10-06T18:00:00Z",
  "nodes": [{ "name": "atlas", "online": true, "cpuPct": 12.3, "memPct": 25, "tempC": 47.3, "uptimeS": 360000, "guestsRunning": 2 }],
  "services": [{ "name": "Jellyfin", "up": true, "uptime24hPct": 99.9 }],
  "sources": { "proxmox": "ok", "prometheus": "ok", "kuma": "ok" }
}
```

Never: hostnames, IPs, URLs, versions, error messages. Node names come only from `ALIASES`
(unaliased → `node-N`); service names come from a *public* Kuma status page and are dropped to
`service-N` if they look like an address. `/api/status` re-applies the same allow-list on the
Cloudflare side, so a misconfigured exporter still can't leak.

## Run

```sh
cp .env.example .env   # fill in; Proxmox token must be PVEAuditor (read-only)
go run .               # or: docker build -t homelab-exporter . && docker run --env-file .env --network host homelab-exporter
curl -s localhost:9477/status | jq
```

Then follow `docs/DEPLOY.md §3` (tunnel + Access service token + Pages secrets).

## Test

```sh
go test ./...   # fake Proxmox/Prometheus/Kuma upstreams that try to leak hostnames, IPs, URLs
```
