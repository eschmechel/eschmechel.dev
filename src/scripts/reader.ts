// Keyboard for the single-post reader: 1–5 jump to a column, Esc/h back to the blog,
// j/k (and arrows) scroll, g/G top/end. Native scrolling handles everything else.

const TYPING = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

export function initReader(): void {
  const reader = document.getElementById('reader');
  if (!reader) return;
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav]'));
  const smooth = (): ScrollBehavior => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

  reader.focus({ preventScroll: true }); // so Space / PageDown scroll the article

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as Element | null)?.closest?.(TYPING)) return;
    const k = e.key;
    if (/^[1-9]$/.test(k) && navLinks[Number(k) - 1]) {
      location.href = navLinks[Number(k) - 1].href;
    } else if (k === 'Escape' || k === 'h' || k === 'ArrowLeft') {
      location.href = '/blog';
    } else if (k === 'j' || k === 'ArrowDown') {
      reader.scrollBy({ top: 80, behavior: smooth() });
    } else if (k === 'k' || k === 'ArrowUp') {
      reader.scrollBy({ top: -80, behavior: smooth() });
    } else if (k === 'g') {
      reader.scrollTo({ top: 0, behavior: smooth() });
    } else if (k === 'G') {
      reader.scrollTo({ top: reader.scrollHeight, behavior: smooth() });
    } else {
      return;
    }
    e.preventDefault();
  });
}
