// Live homelab panel in ~/ (D25–D28): polls /api/status only while the ~/ column is showing.
// Numbers only — no bars (D12).

interface Node {
  name: string;
  online: boolean;
  cpuPct: number;
  memPct: number;
  tempC: number | null;
  uptimeS: number;
  guestsRunning: number;
}
interface Service {
  name: string;
  up: boolean;
  uptime24hPct: number | null;
}
interface Status {
  configured: boolean;
  stale?: boolean;
  fetchedAt?: string;
  nodes?: Node[];
  services?: Service[];
}

const REFRESH_MS = 60_000;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function uptime(s: number): string {
  const d = Math.floor(s / 86_400);
  const h = Math.floor((s % 86_400) / 3600);
  return d ? `${d}d ${h}h` : `${h}h ${Math.floor((s % 3600) / 60)}m`;
}

function ago(iso: string): string {
  const s = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 90) return `${s}s ago`;
  if (s < 5400) return `${Math.round(s / 60)}m ago`;
  if (s < 172_800) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86_400)}d ago`;
}

function render(root: HTMLElement, data: Status | null): void {
  root.replaceChildren();
  if (!data) {
    root.append(el('p', 'lab__note', 'lab status unavailable right now.'));
    root.dataset.state = 'offline';
    return;
  }
  if (!data.configured) {
    root.append(el('p', 'lab__note', 'not wired up yet — the lab will report here once its tunnel is live.'));
    root.dataset.state = 'unconfigured';
    return;
  }
  root.dataset.state = data.stale ? 'stale' : 'live';

  if (data.nodes?.length) {
    const table = el('table', 'lab__nodes');
    const head = el('tr');
    for (const h of ['node', 'cpu', 'mem', 'temp', 'guests', 'up']) head.append(el('th', undefined, h));
    table.append(head);
    for (const n of data.nodes) {
      const row = el('tr', n.online ? '' : 'is-down');
      row.append(
        el('td', undefined, `${n.online ? '●' : '○'} ${n.name}`),
        el('td', undefined, n.online ? `${n.cpuPct}%` : '—'),
        el('td', undefined, n.online ? `${Math.round(n.memPct)}%` : '—'),
        el('td', undefined, n.tempC === null ? '—' : `${Math.round(n.tempC)}°C`),
        el('td', undefined, String(n.guestsRunning)),
        el('td', undefined, n.online ? uptime(n.uptimeS) : 'down'),
      );
      table.append(row);
    }
    root.append(table);
  }

  if (data.services?.length) {
    const list = el('ul', 'lab__svcs');
    for (const s of data.services) {
      const li = el('li', s.up ? 'is-up' : 'is-down');
      li.append(el('span', 'lab__dot', s.up ? '●' : '○'), ` ${s.name}`);
      if (s.uptime24hPct !== null) li.append(el('span', 'lab__pct', ` ${s.uptime24hPct}%`));
      list.append(li);
    }
    root.append(list);
  }

  const when = data.fetchedAt ? ago(data.fetchedAt) : 'just now';
  root.append(el('p', 'lab__note', data.stale ? `last seen ${when} — lab offline` : `updated ${when} · refreshes every minute`));
}

export function initHomelab(): void {
  const root = document.getElementById('homelab');
  if (!root) return;
  let timer = 0;

  async function refresh(): Promise<void> {
    try {
      const res = await fetch('/api/status', { headers: { accept: 'application/json' } });
      render(root!, res.ok ? ((await res.json()) as Status) : null);
    } catch {
      render(root!, null);
    }
  }

  function onColumn(col: string | undefined): void {
    window.clearInterval(timer);
    if (col !== 'home') return;
    void refresh();
    timer = window.setInterval(refresh, REFRESH_MS);
  }

  document.addEventListener('carousel:changed', (e) => onColumn((e as CustomEvent<{ col: string }>).detail.col));
  onColumn(document.querySelector<HTMLElement>('.column[data-active="true"]')?.dataset.id);
}
