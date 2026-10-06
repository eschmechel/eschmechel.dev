// Command bar + agent client + tiger companion (D8, D18, D46).
// `/` or `:` opens a prompt over the footer. `:commands` run locally; anything else is a
// question for /api/chat, answered in the ask panel on the whoami column.

type TigerState = 'idle' | 'think' | 'pounce' | 'asleep';

const EARS = ' /\\=/\\';
const FACES: Record<TigerState, string> = {
  idle: `${EARS}\n(=o.o=)~`,
  think: `${EARS} .\n(=o.o=)?`,
  pounce: `${EARS} !\n(=O.O=)~`,
  asleep: `${EARS} z\n(=-.-=)~`,
};
const BLINK = `${EARS}\n(=-.-=)~`;

const COLUMNS = ['whoami', 'projects', 'resume', 'blog', 'home'];
const COMMANDS = [':help', ':whoami', ':projects', ':resume', ':blog', ':home', ':open', ':pdf', ':rss', ':email', ':clear', ':theme', ':tiger'];
const TYPING = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

interface Targets {
  projects: string[];
  posts: string[];
}

function goColumn(col: string, panel?: string): void {
  document.dispatchEvent(new CustomEvent('carousel:go', { detail: { col, panel } }));
}

export function initCommandBar(): void {
  const bar = document.getElementById('cmdbar');
  const form = document.getElementById('cmd-form') as HTMLFormElement | null;
  const input = document.getElementById('cmd-input') as HTMLInputElement | null;
  const tiger = document.getElementById('tiger');
  const fab = document.getElementById('cmd-fab');
  const log = document.getElementById('agent-log');
  if (!bar || !form || !input || !tiger || !log) return;

  const targets: Targets = JSON.parse(bar.dataset.targets ?? '{"projects":[],"posts":[]}');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const history: string[] = [];
  let cursor = 0;
  let busy = false;

  // ── tiger ────────────────────────────────────────────────────────────
  let thinkTimer = 0;
  function setTiger(state: TigerState): void {
    window.clearInterval(thinkTimer);
    tiger!.dataset.state = state;
    tiger!.textContent = FACES[state];
    if (state === 'think' && !reduced.matches) {
      let dots = 1;
      thinkTimer = window.setInterval(() => {
        dots = (dots % 3) + 1;
        tiger!.textContent = `${EARS} ${'.'.repeat(dots)}\n(=o.o=)?`;
      }, 380);
    }
    if (state === 'pounce') window.setTimeout(() => tiger!.dataset.state === 'pounce' && setTiger('idle'), 1400);
  }
  (function blinkLater() {
    window.setTimeout(() => {
      if (!reduced.matches && tiger!.dataset.state === 'idle') {
        tiger!.textContent = BLINK;
        window.setTimeout(() => tiger!.dataset.state === 'idle' && (tiger!.textContent = FACES.idle), 160);
      }
      blinkLater();
    }, 3500 + Math.random() * 4000);
  })();

  // ── transcript ───────────────────────────────────────────────────────
  function write(kind: 'q' | 'a' | 'sys' | 'err', text: string): HTMLElement {
    log!.querySelector('.log__hint')?.remove();
    const line = document.createElement('p');
    line.className = `log__${kind}`;
    line.textContent = kind === 'q' ? `> ${text}` : text;
    log!.append(line);
    log!.scrollTop = log!.scrollHeight;
    return line;
  }

  // ── open / close ─────────────────────────────────────────────────────
  function open(prefill = ''): void {
    bar!.hidden = false;
    input!.value = prefill;
    input!.focus();
    cursor = history.length;
  }
  function close(): void {
    bar!.hidden = true;
    input!.blur();
  }

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector('dialog[open]')) return;
    if ((e.target as Element | null)?.closest?.(TYPING)) return;
    if (e.key === '/' || e.key === ':') {
      e.preventDefault();
      open(e.key === ':' ? ':' : '');
    }
  });
  fab?.addEventListener('click', () => open());

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      cursor = Math.max(0, cursor - 1);
      input.value = history[cursor];
    } else if (e.key === 'ArrowDown' && history.length) {
      e.preventDefault();
      cursor = Math.min(history.length, cursor + 1);
      input.value = history[cursor] ?? '';
    }
  });

  function complete(): void {
    const v = input!.value;
    const open = v.match(/^:open\s+(\S*)$/);
    const pool = open ? [...targets.projects, ...targets.posts].map((t) => `:open ${t}`) : COMMANDS;
    const hits = pool.filter((c) => c.startsWith(v));
    if (hits.length === 1) input!.value = hits[0] + (hits[0] === ':open' ? ' ' : '');
    else if (hits.length > 1) {
      // extend to the longest shared prefix, like a shell
      let prefix = hits[0];
      for (const h of hits) while (!h.startsWith(prefix)) prefix = prefix.slice(0, -1);
      input!.value = prefix;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;
    history.push(raw);
    cursor = history.length;
    input.value = '';
    if (raw.startsWith(':') || raw === '?') runCommand(raw === '?' ? ':help' : raw);
    else void ask(raw);
  });

  // suggestion buttons in the ask panel
  document.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-ask]');
    if (b?.dataset.ask) void ask(b.dataset.ask);
  });

  // ── commands ─────────────────────────────────────────────────────────
  function runCommand(raw: string): void {
    const [cmd, ...rest] = raw.slice(1).split(/\s+/);
    const arg = rest.join(' ');
    const col = cmd === '~' ? 'home' : /^[1-5]$/.test(cmd) ? COLUMNS[Number(cmd) - 1] : cmd;

    if (COLUMNS.includes(col)) {
      close();
      goColumn(col);
      return;
    }
    switch (cmd) {
      case 'help':
      case 'h':
        goColumn('whoami', 'ask');
        write('q', raw);
        write(
          'sys',
          [
            ':whoami :projects :resume :blog :home   jump to a column (or :1–:5)',
            ':open <project|post>                     open a project panel or blog post (tab completes)',
            ':pdf  :rss  :email                       resume PDF, feed, write to me',
            ':clear                                   clear this panel',
            'anything else                            ask the agent about Elliott',
          ].join('\n'),
        );
        return;
      case 'open': {
        if (targets.projects.includes(arg)) {
          close();
          goColumn('projects', arg);
        } else if (targets.posts.includes(arg)) {
          location.href = `/blog/${arg}`;
        } else {
          goColumn('whoami', 'ask');
          write('q', raw);
          write('err', arg ? `nothing called "${arg}" — tab completes names` : 'usage: :open <project|post>');
        }
        return;
      }
      case 'pdf':
        location.href = '/Elliott-Schmechel-Resume.pdf';
        return;
      case 'rss':
        location.href = '/rss.xml';
        return;
      case 'email':
        location.href = 'mailto:elliottschmechel@gmail.com';
        return;
      case 'clear':
        log!.replaceChildren();
        return;
      case 'tiger':
        setTiger('pounce');
        return;
      case 'theme':
        goColumn('whoami', 'ask');
        write('q', raw);
        write('sys', 'only dark for now — a light theme is on the list.');
        return;
      default:
        goColumn('whoami', 'ask');
        write('q', raw);
        write('err', `unknown command ${raw.split(/\s/)[0]} — try :help`);
    }
  }

  // ── agent ────────────────────────────────────────────────────────────
  async function ask(question: string): Promise<void> {
    if (busy) return;
    busy = true;
    goColumn('whoami', 'ask');
    write('q', question);
    const pending = write('sys', '…');
    setTiger('think');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: question }),
      });
      const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
      if (res.ok && data.answer) {
        pending.className = 'log__a';
        pending.textContent = data.answer;
        setTiger('pounce');
      } else if (res.status === 429) {
        pending.className = 'log__err';
        pending.textContent = data.error ?? "that's a lot of questions — try again in a bit.";
        setTiger('idle');
      } else if (res.status === 503) {
        pending.className = 'log__err';
        pending.textContent = data.error ?? "the agent's asleep for today — try :help, or email elliottschmechel@gmail.com.";
        setTiger('asleep');
      } else {
        throw new Error(String(res.status));
      }
    } catch {
      pending.className = 'log__err';
      pending.textContent = 'agent offline right now — :help still works, or email elliottschmechel@gmail.com.';
      setTiger('asleep');
    } finally {
      busy = false;
      log!.scrollTop = log!.scrollHeight;
    }
  }
}
