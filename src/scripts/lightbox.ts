// In-page image viewer for project thumbnails. Thumbnails stay plain links to the full image,
// so without JS (or with a modifier-click) they still open normally.

export function initLightbox(): void {
  const dialog = document.getElementById('lightbox') as HTMLDialogElement | null;
  if (!dialog) return;
  const img = dialog.querySelector<HTMLImageElement>('#lightbox-img')!;
  const label = dialog.querySelector<HTMLElement>('#lightbox-label')!;
  const count = dialog.querySelector<HTMLElement>('#lightbox-count')!;
  const caption = dialog.querySelector<HTMLElement>('#lightbox-caption')!;
  const nav = dialog.querySelector<HTMLElement>('#lightbox-nav')!;

  let group: HTMLAnchorElement[] = [];
  let index = 0;
  let opener: HTMLElement | null = null;

  function show(i: number): void {
    index = (i + group.length) % group.length;
    const a = group[index];
    img.src = a.dataset.full ?? a.href;
    img.alt = a.dataset.alt ?? '';
    if (a.dataset.w && a.dataset.h) {
      img.width = Number(a.dataset.w);
      img.height = Number(a.dataset.h);
    }
    label.textContent = a.dataset.group ?? 'image';
    caption.textContent = a.dataset.alt ?? '';
    count.textContent = group.length > 1 ? `${index + 1}/${group.length}` : '';
    nav.hidden = group.length < 2;
  }

  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-lightbox]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    group = Array.from(document.querySelectorAll<HTMLAnchorElement>(`a[data-lightbox="${a.dataset.lightbox}"]`));
    opener = a;
    show(group.indexOf(a));
    dialog.showModal();
  });

  dialog.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t === dialog || t.closest('[data-close]')) dialog.close();
    const step = t.closest<HTMLElement>('[data-step]')?.dataset.step;
    if (step) show(index + Number(step));
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'l') show(index + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'h') show(index - 1);
    else return;
    e.preventDefault();
  });

  dialog.addEventListener('close', () => {
    img.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
}
