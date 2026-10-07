# homelab-exporter

Publishes a **sanitised** health snapshot of the lab for the `~/` panel on eschmechel.dev (D25–D28).

```
Proxmox ─┐
Prometheus ─┼─> homelab-exporter :9477/status ─> cloudflared ─> Cloudflare Access (service token) ─> /api/status (Worker) ─> ~/
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

## Proxmox token

Read-only: a dedicated user with `PVEAuditor` on `/`, and a token that inherits it. On a Proxmox node:

```sh
pveum user add siteaudit@pve --comment "eschmechel.dev status page (read-only)"
pveum acl modify / --users siteaudit@pve --roles PVEAuditor
pveum user token add siteaudit@pve site --privsep 0   # prints the secret once
```

`.env`: `PROXMOX_TOKEN=siteaudit@pve!site=<secret>`. `PVEAuditor` can read node/guest status but can't
change, start or console into anything.

## Run

Docker (with its own tunnel — see `compose.yaml` and `docs/DEPLOY.md §3`):

```sh
cp .env.example .env   # fill in PROXMOX_*, ALIASES, TUNNEL_TOKEN
docker compose up -d --build
docker compose logs -f
```

Or locally for a quick look: `go run .` then `curl -s localhost:9477/status | jq`.

## Test

```sh
go test ./...   # fake Proxmox/Prometheus/Kuma upstreams that try to leak hostnames, IPs, URLs
```
