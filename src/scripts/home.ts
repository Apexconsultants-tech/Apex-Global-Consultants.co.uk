// Homepage behaviour: hero scene pause control, "I need help with" selector, service explorer, software tabs,
// and the How We Work progress line.
import { reducedMotion } from './site';

/** Hero scene: show the pause button, and pause when off-screen, in a hidden tab or on request. */
function initHero(signal: AbortSignal) {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const btn = hero?.querySelector<HTMLButtonElement>('[data-hero-toggle]');
  if (!hero || !btn || reducedMotion()) return; // reduced motion: CSS shows the finished still scene

  let userPaused = false;
  let inView = true;
  const sync = () => hero.toggleAttribute('data-paused', userPaused || !inView || document.hidden);

  btn.hidden = false;
  btn.addEventListener('click', () => {
    userPaused = !userPaused;
    btn.setAttribute('aria-pressed', String(userPaused));
    btn.querySelector('.sr-only')!.textContent = userPaused ? 'Play animation' : 'Pause animation';
    sync();
  }, { signal });
  const io = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    sync();
  });
  io.observe(hero);
  signal.addEventListener('abort', () => io.disconnect());
  document.addEventListener('visibilitychange', sync, { signal });
}

/** "I need help with" custom combobox: always opens downwards, same font for value and options. */
function initHelp(signal: AbortSignal) {
  const form = document.querySelector<HTMLFormElement>('[data-help]');
  const combo = form?.querySelector<HTMLElement>('[data-combo]');
  if (!form || !combo) return;
  const native = combo.querySelector('select')!;
  const btn = combo.querySelector<HTMLButtonElement>('[data-combo-btn]')!;
  const list = combo.querySelector<HTMLElement>('[data-combo-list]')!;
  const valueEl = btn.querySelector<HTMLElement>('.help-value')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const opts = [...list.querySelectorAll<HTMLElement>('[role=option]')];

  // Swap the native select for the custom control.
  native.hidden = true;
  native.tabIndex = -1;
  btn.hidden = false;
  combo.dataset.ready = '';

  let active = -1;
  let typed = '';
  let typedTimer = 0;
  const isOpen = () => btn.getAttribute('aria-expanded') === 'true';

  const setActive = (i: number, scroll = true) => {
    active = Math.max(0, Math.min(opts.length - 1, i));
    opts.forEach((o, k) => o.classList.toggle('is-active', k === active));
    btn.setAttribute('aria-activedescendant', opts[active].id);
    if (scroll) opts[active].scrollIntoView({ block: 'nearest' });
  };
  const selected = () => opts.findIndex((o) => o.getAttribute('aria-selected') === 'true');

  const open = () => {
    if (isOpen()) return;
    list.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => list.classList.add('is-open'));
    // The list opens downwards OVER the page and scrolls inside itself, so the page (and the
    // "Show me" button) stays where it is. Only if the field sits too low to show a useful list
    // is the field lifted once to just under the sticky header.
    const fieldTop = btn.getBoundingClientRect().top;
    let room = innerHeight - btn.getBoundingClientRect().bottom - 24;
    if (room < 260) {
      const lift = fieldTop - 128;
      if (lift > 0) {
        scrollBy({ top: lift, behavior: reducedMotion() ? 'auto' : 'smooth' });
        room += lift;
      }
    }
    list.style.maxHeight = `${Math.max(220, Math.min(room, 640))}px`;
    setActive(selected() >= 0 ? selected() : 0);
  };
  const close = () => {
    if (!isOpen()) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.removeAttribute('aria-activedescendant');
    list.classList.remove('is-open');
    list.hidden = true;
  };
  const choose = (i: number) => {
    opts.forEach((o, k) => o.setAttribute('aria-selected', String(k === i)));
    valueEl.textContent = opts[i].querySelector('.help-opt-text')!.textContent;
    combo.dataset.chosen = '';
    native.value = opts[i].dataset.value!;
    close();
    // Hand straight over to "Show me": it is on screen, focused and highlighted.
    submitBtn.classList.remove('is-ready');
    void submitBtn.offsetWidth;
    submitBtn.classList.add('is-ready');
    submitBtn.focus({ preventScroll: true });
  };

  btn.addEventListener('click', () => (isOpen() ? close() : open()), { signal });
  btn.addEventListener('keydown', (e) => {
    const k = e.key;
    if (!isOpen()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(k)) { e.preventDefault(); open(); }
      else if (k.length === 1 && /S/.test(k)) { open(); typeahead(k); }
      return;
    }
    if (k === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (k === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (k === 'Home') { e.preventDefault(); setActive(0); }
    else if (k === 'End') { e.preventDefault(); setActive(opts.length - 1); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); choose(active); }
    else if (k === 'Escape') { e.preventDefault(); close(); }
    else if (k === 'Tab') { choose(active); }
    else if (k.length === 1 && /S/.test(k)) typeahead(k);
  }, { signal });

  function typeahead(ch: string) {
    clearTimeout(typedTimer);
    typed += ch.toLowerCase();
    typedTimer = window.setTimeout(() => (typed = ''), 600);
    const start = typed.length === 1 ? active + 1 : active;
    const order = [...opts.slice(start), ...opts.slice(0, start)];
    const hit = order.find((o) => o.textContent!.trim().toLowerCase().startsWith(typed));
    if (hit) setActive(opts.indexOf(hit));
  }

  opts.forEach((o, i) => {
    o.addEventListener('click', () => choose(i), { signal });
    o.addEventListener('pointermove', () => active !== i && setActive(i, false), { signal });
  });
  // Keep focus on the button while clicking inside the list.
  list.addEventListener('mousedown', (e) => e.preventDefault(), { signal });
  document.addEventListener('click', (e) => !combo.contains(e.target as Node) && close(), { signal });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!native.value) { open(); btn.focus(); return; }
    location.href = native.value;
  }, { signal });
}

function initExplorer(signal: AbortSignal) {
  const root = document.querySelector<HTMLElement>('[data-explorer]');
  if (!root) return;
  const btns = [...root.querySelectorAll<HTMLButtonElement>('[data-ex-btn]')];
  const desktop = matchMedia('(min-width: 1024px)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const panelOf = (b: HTMLButtonElement) => document.getElementById(b.getAttribute('aria-controls')!)!;
  const set = (b: HTMLButtonElement, open: boolean) => {
    b.setAttribute('aria-expanded', String(open));
    panelOf(b).dataset.open = String(open);
  };
  const select = (b: HTMLButtonElement) => btns.forEach((x) => set(x, x === b));

  btns.forEach((b) => {
    b.addEventListener('click', () => {
      if (desktop.matches) select(b);
      else set(b, b.getAttribute('aria-expanded') !== 'true');
    }, { signal });
    b.addEventListener('pointerenter', () => desktop.matches && hover.matches && select(b), { signal });
    b.addEventListener('keydown', (e) => {
      if (!desktop.matches || !['ArrowDown', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const i = btns.indexOf(b) + (e.key === 'ArrowDown' ? 1 : -1);
      const next = btns[(i + btns.length) % btns.length];
      next.focus();
      select(next);
    }, { signal });
  });
  // Entering desktop: make sure exactly one panel is open.
  const normalise = () => {
    if (!desktop.matches) return;
    const open = btns.find((b) => b.getAttribute('aria-expanded') === 'true') ?? btns[0];
    select(open);
  };
  desktop.addEventListener('change', normalise, { signal });
  normalise();
}

function initTabs(signal: AbortSignal) {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
    const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role=tab]')];
    const dash = root.querySelector<HTMLElement>('[data-dash]');
    const activate = (t: HTMLButtonElement, focus = false) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')!)!.hidden = !on;
      });
      if (focus) t.focus();
      t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
      if (dash && t.dataset.mock && dash.dataset.view !== t.dataset.mock) {
        dash.dataset.view = t.dataset.mock;
        dash.classList.remove('is-anim');
        void dash.offsetWidth; // restart the CSS animation
        dash.classList.add('is-anim');
      }
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => activate(t), { signal });
      t.addEventListener('keydown', (e) => {
        const k = e.key;
        let n = -1;
        if (k === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') n = 0;
        else if (k === 'End') n = tabs.length - 1;
        if (n < 0) return;
        e.preventDefault();
        activate(tabs[n], true);
      }, { signal });
    });
    const first = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    if (dash && first?.dataset.mock) dash.dataset.view = first.dataset.mock;
  });
}

function initSteps(signal: AbortSignal) {
  const track = document.querySelector<HTMLElement>('[data-steps-track]');
  const line = track?.querySelector<HTMLElement>('[data-steps-line]');
  if (!track || !line) return;
  const items = [...track.querySelectorAll<HTMLElement>('[data-step]')];
  const nums = items.map((li) => li.querySelector<HTMLElement>('.step-num')!);
  const wide = matchMedia('(min-width: 1024px)');
  let len = 0;
  let stops: number[] = [];

  // Place the line from the centre of circle 1 to the centre of circle 5.
  const layout = () => {
    const t = track.getBoundingClientRect();
    const c = nums.map((n) => { const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2 - t.left, y: r.top + r.height / 2 - t.top }; });
    const x = wide.matches;
    track.dataset.dir = x ? 'x' : 'y';
    const a = c[0], z = c[c.length - 1];
    len = Math.max(1, x ? z.x - a.x : z.y - a.y);
    Object.assign(line.style, x
      ? { left: a.x + 'px', top: a.y - 2 + 'px', width: len + 'px', height: '4px' }
      : { left: a.x - 2 + 'px', top: a.y + 'px', width: '4px', height: len + 'px' });
    stops = c.map((p) => ((x ? p.x - a.x : p.y - a.y) / len));
  };

  const paint = (p: number) => {
    track.style.setProperty('--progress', p.toFixed(4));
    track.style.setProperty('--dot', (p * len).toFixed(1) + 'px');
    items.forEach((li, i) => li.toggleAttribute('data-active', p >= stops[i] - 0.002));
  };

  let raf = 0;
  const update = () => {
    raf = 0;
    const t = track.getBoundingClientRect();
    const first = nums[0].getBoundingClientRect();
    // Desktop: fills while the row moves from 80% to 35% of the viewport height.
    // Phones: the line follows a reading point 60% down the screen.
    const p = wide.matches
      ? (innerHeight * 0.8 - t.top) / (innerHeight * 0.45)
      : (innerHeight * 0.6 - (first.top + first.height / 2)) / len;
    paint(Math.max(0, Math.min(1, p)));
  };
  const onScroll = () => (raf ||= requestAnimationFrame(update));
  const relayout = () => { layout(); update(); };

  relayout();
  if (reducedMotion()) return paint(1);
  addEventListener('scroll', onScroll, { passive: true, signal });
  const ro = new ResizeObserver(relayout);
  ro.observe(track);
  signal.addEventListener('abort', () => ro.disconnect());
  wide.addEventListener('change', relayout, { signal });
}

let ctrl: AbortController | undefined;
document.addEventListener('astro:page-load', () => {
  ctrl?.abort();
  ctrl = new AbortController();
  const { signal } = ctrl;
  initHero(signal);
  initHelp(signal);
  initExplorer(signal);
  initTabs(signal);
  initSteps(signal);
});
