// page behavior.

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
