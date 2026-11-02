// page behavior.

import { startBallerina } from './ballerina';

const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// typing intro

const typed = document.getElementById('typed');
if (typed && !calm) {
  const text = typed.textContent ?? '';
  const html = typed.innerHTML;
  typed.textContent = '';
  typed.classList.add('typing');
  let shown = 0;
  const tick = () => {
    shown += 1;
    typed.textContent = text.slice(0, shown);
    if (shown < text.length) setTimeout(tick, 75);
    else {
      typed.innerHTML = html;
      typed.classList.remove('typing');
    }
  };
  setTimeout(tick, 300);
}

// active tab

const tabs = new Map<string, HTMLElement>();
document.querySelectorAll<HTMLElement>('.bar a[data-sec]').forEach((a) => {
  if (a.dataset.sec) tabs.set(a.dataset.sec, a);
});

// sections without a tab map to a neighbor's tab.
const alias: Record<string, string> = { interests: 'whoami', term: 'elsewhere' };

function mark(id: string) {
  const key = tabs.has(id) ? id : alias[id];
  if (!key || !tabs.has(key)) return;
  tabs.forEach((a, k) => {
    const on = k === key;
    a.classList.toggle('on', on);
    if (on) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

const sections = Array.from(document.querySelectorAll<HTMLElement>('main > section[id]'));

// the last section whose top has passed a line near the top of the screen is current.
// at the very bottom of the page the last section wins.
function current() {
  const line = Math.min(innerHeight * 0.25, 200);
  let id = sections[0]?.id ?? '';
  for (const s of sections) if (s.getBoundingClientRect().top <= line) id = s.id;
  const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom && sections.length) id = sections[sections.length - 1].id;
  return id;
}

// a section jumped to by a link stays marked until the visitor scrolls on their own.
let pinned: string | null = null;

function pin(targetId: string) {
  const section = document.getElementById(targetId)?.closest<HTMLElement>('main > section[id]');
  if (!section) return;
  pinned = section.id;
  mark(pinned);
}

const unpin = () => (pinned = null);
addEventListener('wheel', unpin, { passive: true });
addEventListener('touchstart', unpin, { passive: true });
addEventListener('keydown', (e) => {
  const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
  if (scrollKeys.includes(e.key) && !(e.target as HTMLElement).closest('input, textarea')) unpin();
});

document.addEventListener('click', (e) => {
  const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  if (link) pin(link.hash.slice(1));
});

addEventListener('scroll', () => pinned || mark(current()), { passive: true });
mark(current());

// theme

const root = document.documentElement;

const systemDark = matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () =>
  (root.dataset.theme as 'light' | 'dark' | undefined) ?? (systemDark.matches ? 'dark' : 'light');

function setTheme(next: 'light' | 'dark') {
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {}
}

function toggleTheme() {
  setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  return currentTheme();
}

document.getElementById('theme')?.addEventListener('click', toggleTheme);

// terminal

// set when a command jumps to a section, so the input does not pull the page back.
let jumped = false;

function goTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  jumped = true;
  pin(id);
  // after the current frame, so nothing else cancels the scroll.
  requestAnimationFrame(() => target.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' }));
}

const term = document.getElementById('term');
const log = document.getElementById('log');
const input = document.getElementById('cmd') as HTMLInputElement | null;

if (term && log && input) {
  const cfg = term.dataset;
  const dirs = (cfg.dirs ?? '').split(',').filter(Boolean);
  const promptHtml = () =>
    `<span class="u">${esc(cfg.user ?? '')}</span>:<span class="p">~</span>$ `;

  function esc(s: string) {
    return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  }
  function print(html: string, cls = '') {
    const line = document.createElement('div');
    line.className = `line ${cls}`.trim();
    line.innerHTML = html;
    log!.appendChild(line);
  }
  function open(url: string, label: string) {
    if (!url) return print(`${label}: not set yet`, 'dim');
    print(`opening ${esc(label)}`, 'dim');
    window.open(url, '_blank', 'noopener');
  }

  const commands: Record<string, { help: string; run: (arg: string) => void }> = {
    help: {
      help: 'list commands',
      run: () => {
        const rows = Object.entries(commands)
          .map(([name, c]) => `<span class="k">${name.padEnd(10, ' ')}</span>${c.help}`)
          .join('<br>');
        print(`${rows}<br><span class="dim">tab completes, up and down walk history</span>`);
      },
    },
    ls: { help: 'list sections', run: () => print(dirs.map((d) => `${d}/`).join('  ')) },
    cd: {
      help: 'jump to a section, e.g. cd projects',
      run: (arg) => {
        const dir = arg.replace(/^~\/?/, '').replace(/\/$/, '');
        if (!dir || dir === '..' || dir === '~') return goTo('whoami');
        if (dirs.includes(dir)) goTo(dir);
        else print(`cd: no such directory: ${esc(dir)}`, 'err');
      },
    },
    whoami: { help: 'back to the top', run: () => goTo('whoami') },
    email: {
      help: 'write me an email',
      run: () => {
        const addr = cfg.email ?? '';
        // the address as a link, copied too, since mailto does nothing without a mail app.
        print(`<a href="mailto:${esc(addr)}">${esc(addr)}</a>`);
        navigator.clipboard?.writeText(addr).then(
          () => print('copied to clipboard', 'dim'),
          () => {},
        );
        const link = document.createElement('a');
        link.href = `mailto:${addr}`;
        link.click();
      },
    },
    resume: { help: 'open my resume', run: () => open(cfg.resume ?? '', 'resume') },
    github: { help: 'open my github', run: () => open(cfg.github ?? '', 'github') },
    theme: { help: 'switch light or dark', run: () => print(`theme: ${toggleTheme()}`, 'dim') },
    date: { help: 'print the date', run: () => print(new Date().toDateString()) },
    musicbox: { help: 'open the music box', run: () => openMusicBox() },
    clear: {
      help: 'clear the screen',
      run: () => {
        endDance(true);
        log!.innerHTML = '';
      },
    },
  };

  // up and down arrows move through history.
  const history: string[] = [];
  let pos = 0;
  let draft = '';

  function walk(step: number) {
    if (!history.length) return;
    if (pos === history.length) draft = input!.value;
    pos = Math.min(Math.max(pos + step, 0), history.length);
    input!.value = pos === history.length ? draft : history[pos];
    requestAnimationFrame(() => input!.setSelectionRange(input!.value.length, input!.value.length));
  }

  // tab completes a command, or a section after cd.
  function complete() {
    const words = input!.value.split(/\s+/);
    const first = words.length <= 1;
    const pool = first ? Object.keys(commands) : words[0] === 'cd' ? dirs : [];
    const part = (words[words.length - 1] ?? '').toLowerCase();
    const hits = pool.filter((w) => w.startsWith(part));
    if (!hits.length) return;
    if (hits.length === 1) {
      words[words.length - 1] = hits[0] + (first ? ' ' : '');
      input!.value = words.join(' ');
      return;
    }
    // several matches: fill the shared prefix, else list them.
    let common = hits[0];
    for (const h of hits) while (!h.startsWith(common)) common = common.slice(0, -1);
    if (common.length > part.length) {
      words[words.length - 1] = common;
      input!.value = words.join(' ');
    } else {
      print(promptHtml() + esc(input!.value));
      print(hits.join('  '), 'dim');
    }
  }

  // the music box: a ballerina turning a pirouette.
  let stopDance: (() => void) | null = null;
  let stage: HTMLElement | null = null;

  function endDance(quiet = false) {
    if (!stopDance) return;
    stopDance();
    stopDance = null;
    stage?.remove();
    stage = null;
    if (!quiet) print('the curtain falls', 'dim');
  }

  function openMusicBox() {
    endDance(true);
    stage = document.createElement('div');
    stage.className = 'stage';
    stage.innerHTML = '<pre class="ballet" aria-label="an ASCII ballerina turning a pirouette"></pre><p class="hint">esc or q to stop</p>';
    log!.appendChild(stage);
    // the stage has 36px of padding and border around the figure.
    stopDance = startBallerina(stage.querySelector('pre')!, calm, () => log!.clientWidth - 40);
  }

  function run(raw: string) {
    print(promptHtml() + esc(raw));
    if (!raw) return;
    if (history[history.length - 1] !== raw) history.push(raw);
    const lower = raw.toLowerCase().replace(/\s+/g, ' ');
    if (stopDance && ['q', 'exit', 'stop'].includes(lower)) return endDance();
    const [name, arg = ''] = raw.split(/\s+/);
    const cmd = commands[name.toLowerCase()];
    if (cmd) cmd.run(arg);
    else print(`command not found: ${esc(name)}. type help`, 'err');
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && stopDance) {
      e.preventDefault();
      endDance();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      walk(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      walk(1);
    } else if (e.key === 'Enter') {
      const raw = input.value.trim();
      input.value = '';
      jumped = false;
      run(raw);
      pos = history.length;
      draft = '';
      if (jumped) input.blur();
      else input.scrollIntoView({ block: 'nearest' });
    }
  });

  // clicks inside the terminal focus the input.
  term.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('a') && !getSelection()?.toString()) input.focus();
  });
}

// sparkles

// a click sends out a few diamonds and glints that drift down as they fade.
function sparkAt(x: number, y: number) {
  const styles = getComputedStyle(document.documentElement);
  const fills = [styles.getPropertyValue('--spark-a'), styles.getPropertyValue('--spark-b')];
  const kinds = ['gem', 'star', 'dot'] as const;
  const count = 7 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const kind = kinds[i % 3];
    const size = kind === 'gem' ? 12 + Math.random() * 6 : kind === 'star' ? 14 + Math.random() * 8 : 4 + Math.random() * 3;
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const reach = 35 + Math.random() * 45;
    const dx = Math.cos(angle) * reach;
    const dy = Math.sin(angle) * reach;
    const fall = 14 + Math.random() * 14;
    // diamonds only tilt, so their cut stays readable.
    const spin = kind === 'gem' ? 20 + Math.random() * 25 : 90 + Math.random() * 90;
    const turn = (Math.random() < 0.5 ? -1 : 1) * spin;

    const s = document.createElement('span');
    s.className = `spark ${kind}`;
    s.style.width = s.style.height = `${size}px`;
    s.style.left = `${x - size / 2}px`;
    s.style.top = `${y - size / 2}px`;
    const fill = document.createElement('i');
    fill.style.backgroundImage = fills[i % 2];
    s.appendChild(fill);
    document.body.appendChild(s);

    s.animate(
      [
        { transform: 'translate(0, 0) scale(0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${dy * 0.6}px) scale(1) rotate(${turn / 3}deg)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${dx * 0.9}px, ${dy * 0.9 + fall * 0.4}px) scale(0.9) rotate(${(turn * 2) / 3}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${dx}px, ${dy + fall}px) scale(0.3) rotate(${turn}deg)`, opacity: 0 },
      ],
      { duration: 950 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.4,1)' },
    ).onfinish = () => s.remove();
  }
}

if (!calm) {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (e.detail === 0 || target.closest('input, textarea')) return;
    if (getSelection()?.toString()) return;
    sparkAt(e.clientX, e.clientY);
  });
}
