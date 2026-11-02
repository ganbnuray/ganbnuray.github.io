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
