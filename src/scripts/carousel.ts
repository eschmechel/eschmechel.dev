// Column carousel: keyboard / nav / click / swipe / wheel switching, panel focus, URL sync.
// SSR already renders the right column (`--i` + data-active), so this only enhances.

const TYPING = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

export function initCarousel(): void {
  const track = document.getElementById('track');
  const viewport = document.getElementById('viewport');
  if (!track || !viewport) return;

  const columns = Array.from(track.querySelectorAll<HTMLElement>('.column'));
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav]'));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const focused = new Map<number, number>(); // column index → focused panel index

  let active = Number(track.dataset.active ?? 0);

  const scrollBehavior = (): ScrollBehavior => (reducedMotion.matches ? 'auto' : 'smooth');
  const panelsOf = (i: number) => Array.from(columns[i].querySelectorAll<HTMLElement>(':scope > [data-panel]'));

  function setFocusedPanel(col: number, idx: number | undefined, scroll = true): void {
    panelsOf(col).forEach((p, j) => (p.dataset.focused = String(j === idx)));
    if (idx === undefined) {
      focused.delete(col);
      return;
    }
    focused.set(col, idx);
    const panel = panelsOf(col)[idx];
    if (scroll && panel) columns[col].scrollTo({ top: Math.max(0, panel.offsetTop - 14), behavior: scrollBehavior() });
  }

  function go(next: number): void {
    const i = Math.max(0, Math.min(columns.length - 1, next));
    if (i === active) return;
    active = i;
    track!.style.setProperty('--i', String(i));
    track!.dataset.active = String(i);
    columns.forEach((c, j) => {
      const on = j === i;
      c.dataset.active = String(on);
      c.inert = !on;
    });
    navLinks.forEach((a, j) => (j === i ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));

    const col = columns[i];
    document.title = col.dataset.title ?? document.title;
    document.documentElement.dataset.col = col.dataset.id;
    if (col.dataset.href && location.pathname.replace(/\/$/, '') !== col.dataset.href.replace(/\/$/, '')) {
      history.replaceState(null, '', col.dataset.href);
    }
  }

  function stepPanel(delta: number): void {
    const count = panelsOf(active).length;
    if (!count) return;
    const cur = focused.get(active);
    const next = cur === undefined ? (delta > 0 ? 0 : count - 1) : Math.max(0, Math.min(count - 1, cur + delta));
    setFocusedPanel(active, next);
  }

  document.documentElement.dataset.col = columns[active]?.dataset.id;

  // nav links: real hrefs without JS; client-side slide with it
  navLinks.forEach((a) =>
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      go(Number(a.dataset.nav));
    }),
  );

  // clicking a dimmed neighbour activates it (inactive columns are inert, so hit-test by x)
  viewport.addEventListener('click', (e) => {
    if ((e.target as Element).closest('.column[data-active="true"]')) return;
    const hit = columns.findIndex((c) => {
      const r = c.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right;
    });
    if (hit !== -1) go(hit);
  });

  // clicking inside a panel focuses it
  track.addEventListener('click', (e) => {
    const panel = (e.target as Element).closest<HTMLElement>('[data-panel]');
    if (!panel) return;
    const idx = panelsOf(active).indexOf(panel);
    if (idx !== -1) setFocusedPanel(active, idx, false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as Element | null)?.closest?.(TYPING)) return;

    const key = e.key;
    if (/^[1-9]$/.test(key)) {
      const i = Number(key) - 1;
      if (i < columns.length) {
        e.preventDefault();
        go(i);
      }
      return;
    }
    switch (key) {
      case 'ArrowLeft':
      case 'h':
        e.preventDefault();
        go(active - 1);
        break;
      case 'ArrowRight':
      case 'l':
        e.preventDefault();
        go(active + 1);
        break;
      case 'ArrowDown':
      case 'j':
        e.preventDefault();
        stepPanel(1);
        break;
      case 'ArrowUp':
      case 'k':
        e.preventDefault();
        stepPanel(-1);
        break;
      case 'Escape':
        setFocusedPanel(active, undefined, false);
        break;
    }
  });

  // horizontal trackpad / shift-wheel → one column per gesture
  let wheelLock = 0;
  viewport.addEventListener(
    'wheel',
    (e) => {
      const dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
      if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = performance.now();
      if (now < wheelLock) return;
      wheelLock = now + 600;
      go(active + Math.sign(dx));
    },
    { passive: false },
  );

  // touch swipe (mobile)
  let sx = 0;
  let sy = 0;
  viewport.addEventListener(
    'touchstart',
    (e) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    },
    { passive: true },
  );
  viewport.addEventListener(
    'touchend',
    (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(active - Math.sign(dx));
    },
    { passive: true },
  );
}
