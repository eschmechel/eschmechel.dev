// GitHub contribution levels for the ~/ heatmap (D11, A5), fetched once at build time.
// A failed fetch never fails the build — the panel just says so. Freshness comes from a daily
// rebuild (.github/workflows/daily-rebuild.yml → Pages deploy hook).

export interface Contributions {
  start: string; // ISO date of the first day
  levels: string; // one digit 0–4 per day, oldest first
  total: number;
}

let cached: Promise<Contributions | null> | undefined;

export function getContributions(user = 'eschmechel'): Promise<Contributions | null> {
  return (cached ??= (async () => {
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { total?: { lastYear?: number }; contributions?: { date: string; level: number }[] };
      const days = data.contributions ?? [];
      if (!days.length) return null;
      return {
        start: days[0].date,
        levels: days.map((d) => Math.max(0, Math.min(4, d.level))).join(''),
        total: data.total?.lastYear ?? 0,
      };
    } catch (err) {
      console.warn(`[github] contributions unavailable (${(err as Error).message}); heatmap will show a fallback`);
      return null;
    }
  })());
}
