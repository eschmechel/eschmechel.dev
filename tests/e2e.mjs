// Phase 3 gate: keys, routes, URL sync, click/swipe, typing guard, reduced motion,
// plus screenshots at 1440 and 390 px into .artifacts/. Run after `npm run build`.
// Uses system Chrome (channel "chrome"); set PW_BUNDLED=1 to use Playwright's own Chromium.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = Number(process.env.E2E_PORT ?? 4393);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = '.artifacts';
mkdirSync(OUT, { recursive: true });

const server = spawn('./node_modules/.bin/astro', ['preview', '--ignore-lock', '--port', String(PORT), '--host', '127.0.0.1'], {
  stdio: 'ignore',
});
const stop = () => server.kill();
process.on('exit', stop);

for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 200));
}

const browser = await chromium.launch(process.env.PW_BUNDLED ? {} : { channel: 'chrome' });
const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push([true, name]);
    console.log(`  ok   ${name}`);
  } catch (err) {
    results.push([false, name]);
    console.log(`  FAIL ${name}\n       ${String(err.message ?? err).split('\n')[0]}`);
  }
}
function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}

const state = (page) =>
  page.evaluate(() => ({
    col: document.documentElement.dataset.col ?? document.querySelector('.column[data-active="true"]')?.dataset.id,
    path: location.pathname.replace(/\/$/, '') || '/',
    title: document.title,
    current: document.querySelector('[data-nav][aria-current="page"]')?.textContent?.trim(),
    focused: [...document.querySelectorAll('.column[data-active="true"] > [data-panel]')].findIndex((p) => p.dataset.focused === 'true'),
    scrollTop: document.querySelector('.column[data-active="true"]')?.scrollTop ?? 0,
    inertOthers: [...document.querySelectorAll('.column:not([data-active="true"])')].every((c) => c.inert),
  }));
const settle = (page) => page.waitForTimeout(500);

// ── desktop ────────────────────────────────────────────────────────────
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const routes = [
  ['/', 'whoami'],
  ['/projects', 'projects'],
  ['/resume', 'resume'],
  ['/blog', 'blog'],
  ['/~', 'home'],
];
for (const [path, id] of routes) {
  await check(`route ${path} opens on ${id}`, async () => {
    await desktop.goto(BASE + path);
    const s = await state(desktop);
    expect(s.col === id, `active ${s.col}`);
    expect(s.inertOthers, 'neighbour columns should be inert');
  });
}

await desktop.goto(BASE + '/');
const keySteps = [
  ['2', 'projects', '/projects'],
  ['ArrowRight', 'resume', '/resume'],
  ['l', 'blog', '/blog'],
  ['h', 'resume', '/resume'],
  ['5', 'home', '/~'],
  ['ArrowRight', 'home', '/~'], // clamps at the last column
  ['1', 'whoami', '/'],
  ['ArrowLeft', 'whoami', '/'], // clamps at the first column
];
for (const [key, id, path] of keySteps) {
  await check(`key ${key} → ${id} + URL ${path}`, async () => {
    await desktop.keyboard.press(key);
    await settle(desktop);
    const s = await state(desktop);
    expect(s.col === id, `active ${s.col}`);
    expect(s.path === path, `url ${s.path}`);
    expect(s.current?.endsWith(id === 'home' ? '~/' : id), `nav aria-current ${s.current}`);
  });
}

await check('title follows the column', async () => {
  await desktop.keyboard.press('3');
  await settle(desktop);
  expect((await state(desktop)).title.startsWith('resume'), 'title');
});

await check('↓ / j / ↑ step panel focus and scroll the column', async () => {
  await desktop.keyboard.press('2');
  await settle(desktop);
  await desktop.keyboard.press('ArrowDown');
  await desktop.keyboard.press('j');
  await desktop.keyboard.press('j');
  await settle(desktop);
  let s = await state(desktop);
  expect(s.focused === 2, `focused ${s.focused}`);
  expect(s.scrollTop > 0, 'column should scroll');
  await desktop.keyboard.press('ArrowUp');
  await settle(desktop);
  s = await state(desktop);
  expect(s.focused === 1, `focused ${s.focused}`);
});

await check('Esc clears panel focus', async () => {
  await desktop.keyboard.press('Escape');
  expect((await state(desktop)).focused === -1, 'still focused');
});

await check('nav link click slides without reload', async () => {
  await desktop.evaluate(() => (window.__noReload = true));
  await desktop.click('[data-nav="3"]');
  await settle(desktop);
  const s = await state(desktop);
  expect(s.col === 'blog' && s.path === '/blog', `${s.col} ${s.path}`);
  expect(await desktop.evaluate(() => window.__noReload === true), 'page reloaded');
});

await check('clicking a dimmed neighbour activates it', async () => {
  await desktop.mouse.click(1380, 450); // right-hand peek
  await settle(desktop);
  expect((await state(desktop)).col === 'home', 'right neighbour');
  await desktop.mouse.click(60, 450); // left-hand peek
  await settle(desktop);
  expect((await state(desktop)).col === 'blog', 'left neighbour');
});

await check('shortcuts ignored while typing', async () => {
  await desktop.evaluate(() => {
    const i = document.createElement('input');
    i.id = 'probe';
    document.body.append(i);
  });
  await desktop.focus('#probe');
  await desktop.keyboard.press('1');
  await desktop.keyboard.press('l');
  expect((await state(desktop)).col === 'blog', 'column changed while typing');
  await desktop.evaluate(() => document.getElementById('probe')?.remove());
});

await check('reduced motion disables the slide', async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await p.goto(BASE + '/');
  const dur = await p.$eval('#track', (t) => getComputedStyle(t).transitionDuration);
  await p.close();
  expect(dur === '0s', `transition ${dur}`);
});

await check('banner glyphs share one advance width and rows touch (aligned art)', async () => {
  await desktop.goto(BASE + '/');
  await desktop.evaluate(() => document.fonts.ready);
  const m = await desktop.$eval('pre.banner', (pre) => {
    const cs = getComputedStyle(pre);
    const probe = document.createElement('span');
    probe.style.cssText = `font:${cs.font};letter-spacing:${cs.letterSpacing};font-variant-ligatures:none;white-space:pre;position:absolute;visibility:hidden`;
    document.body.append(probe);
    const widths = [...new Set(pre.textContent.replace(/\n/g, ''))].map((ch) => {
      probe.textContent = ch.repeat(20);
      return probe.getBoundingClientRect().width / 20;
    });
    probe.remove();
    return { min: Math.min(...widths), max: Math.max(...widths), lh: parseFloat(cs.lineHeight), fs: parseFloat(cs.fontSize), family: cs.fontFamily };
  });
  expect(m.max - m.min < 0.01, `glyph advances differ: ${m.min}–${m.max}px`);
  expect(Math.abs(m.lh - m.fs) < 0.5, `line-height ${m.lh} vs font-size ${m.fs}`);
  expect(m.family.includes('IBM Plex Mono'), `font ${m.family}`);
});

await check('resume PDF link + project thumbnails present', async () => {
  await desktop.goto(BASE + '/resume');
  const href = await desktop.$eval('a.download', (a) => a.getAttribute('href'));
  expect((await fetch(BASE + href)).headers.get('content-type')?.includes('pdf'), 'pdf');
  await desktop.goto(BASE + '/projects');
  const thumbs = await desktop.$$eval('.thumb img', (imgs) => imgs.filter((i) => i.complete && i.naturalWidth > 0).length);
  expect(thumbs === 3, `loaded thumbnails ${thumbs}`);
});

await check('thumbnail opens an in-page lightbox (no new tab, no navigation)', async () => {
  await desktop.goto(BASE + '/projects');
  const pagesBefore = desktop.context().pages().length;
  await desktop.click('a[data-lightbox="hermes-apprentice"] >> nth=0');
  await desktop.waitForFunction(() => document.querySelector('#lightbox')?.open);
  await desktop.waitForFunction(() => {
    const i = document.querySelector('#lightbox-img');
    return i?.complete && i.naturalWidth > 0;
  });
  expect(desktop.context().pages().length === pagesBefore, 'a new tab opened');
  expect((await state(desktop)).path === '/projects', 'page navigated');
  expect((await desktop.textContent('#lightbox-count')) === '1/2', 'counter');
});

await check('lightbox: → cycles within the project and wraps; column keys ignored', async () => {
  await desktop.keyboard.press('ArrowRight');
  expect((await desktop.textContent('#lightbox-count')) === '2/2', 'next');
  await desktop.keyboard.press('ArrowRight');
  expect((await desktop.textContent('#lightbox-count')) === '1/2', 'wrap');
  await desktop.keyboard.press('3');
  expect((await state(desktop)).col === 'projects', 'column changed under the modal');
});

await check('lightbox: Esc closes and returns focus to the thumbnail', async () => {
  await desktop.keyboard.press('Escape');
  expect(!(await desktop.$eval('#lightbox', (d) => d.open)), 'still open');
  expect(await desktop.evaluate(() => document.activeElement?.matches('a[data-lightbox]')), 'focus not restored');
});

await check('lightbox: backdrop click closes; single image hides prev/next', async () => {
  await desktop.click('a[data-lightbox="heard"]');
  await desktop.waitForFunction(() => document.querySelector('#lightbox')?.open);
  expect(await desktop.$eval('#lightbox-nav', (n) => n.hidden), 'nav shown for one image');
  await desktop.mouse.click(8, 8);
  expect(!(await desktop.$eval('#lightbox', (d) => d.open)), 'backdrop click did not close');
});

await desktop.click('a[data-lightbox="hermes-apprentice"] >> nth=1');
await desktop.waitForFunction(() => document.querySelector('#lightbox-img')?.naturalWidth > 0);
await desktop.screenshot({ path: `${OUT}/desktop-1440-lightbox.png` });
await desktop.keyboard.press('Escape');

for (const [path, id] of routes) {
  await desktop.goto(BASE + path);
  await settle(desktop);
  await desktop.screenshot({ path: `${OUT}/desktop-1440-${id}.png` });
}

// ── mobile ─────────────────────────────────────────────────────────────
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
await mobile.goto(BASE + '/');

await check('mobile: word tabs (no [n] key hints)', async () => {
  const hidden = await mobile.$eval('.kbd', (k) => getComputedStyle(k).display === 'none');
  expect(hidden, '[n] visible on mobile');
});

async function swipe(page, dx) {
  await page.evaluate((dx) => {
    const vp = document.getElementById('viewport');
    const t = (x) => new Touch({ identifier: 1, target: vp, clientX: x, clientY: 400 });
    vp.dispatchEvent(new TouchEvent('touchstart', { touches: [t(200)], changedTouches: [t(200)], bubbles: true }));
    vp.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t(200 + dx)], bubbles: true }));
  }, dx);
  await settle(page);
}

await check('mobile: swipe left → next column + URL', async () => {
  await swipe(mobile, -150);
  const s = await state(mobile);
  expect(s.col === 'projects' && s.path === '/projects', `${s.col} ${s.path}`);
});
await mobile.screenshot({ path: `${OUT}/mobile-390-projects.png` });

await check('mobile: swipe right → previous column', async () => {
  await swipe(mobile, 150);
  expect((await state(mobile)).col === 'whoami', 'col');
});
await check('mobile: vertical drag does not switch', async () => {
  await mobile.evaluate(() => {
    const vp = document.getElementById('viewport');
    const t = (x, y) => new Touch({ identifier: 2, target: vp, clientX: x, clientY: y });
    vp.dispatchEvent(new TouchEvent('touchstart', { touches: [t(200, 600)], changedTouches: [t(200, 600)], bubbles: true }));
    vp.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t(130, 200)], bubbles: true }));
  });
  await settle(mobile);
  expect((await state(mobile)).col === 'whoami', 'switched on vertical drag');
});
await mobile.screenshot({ path: `${OUT}/mobile-390-whoami.png` });

await browser.close();
stop();

const passed = results.filter(([ok]) => ok).length;
console.log(`e2e: ${passed}/${results.length}  (screenshots in ${OUT}/)`);
process.exit(passed === results.length ? 0 : 1);
