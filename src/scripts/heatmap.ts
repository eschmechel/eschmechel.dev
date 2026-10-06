// Draws the GitHub heatmap from a compact `data-days` string (one digit 0–4 per day) so the page
// ships ~150 bytes instead of 367 cells of markup — the 14 KB first-flight budget again.

export function initHeatmap(): void {
  const root = document.getElementById('heatmap');
  const levels = root?.dataset.days;
  const start = root?.dataset.start;
  if (!root || !levels || !start) return;

  // pad the first week so rows line up as Sun..Sat
  const lead = new Date(`${start}T00:00:00Z`).getUTCDay();
  const grid = document.createElement('div');
  grid.className = 'heat';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < lead; i++) frag.append(document.createElement('i'));
  for (const ch of levels) {
    const cell = document.createElement('i');
    cell.className = `l${ch}`;
    frag.append(cell);
  }
  grid.append(frag);
  root.replaceChildren(grid);
}
