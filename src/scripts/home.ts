// Homepage behaviour: hero video, "I need help with" selector, service explorer, software tabs,
// badge marquee, count-up stats, steps progress line and testimonial slider.
import { reducedMotion } from './site';

type NetInfo = { saveData?: boolean; effectiveType?: string };

function initHero(signal: AbortSignal) {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const video = hero?.querySelector<HTMLVideoElement>('[data-hero-video]');
  const btn = hero?.querySelector<HTMLButtonElement>('[data-hero-toggle]');
  if (!hero || !video || !btn) return;

  const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
  const slow = conn?.saveData || /(^|-)2g$|^3g$/.test(conn?.effectiveType ?? '');
  if (reducedMotion() || slow) return; // still image only

  let userPaused = false;
  let inView = true;
  const setBtn = (playing: boolean) => {
    btn.setAttribute('aria-pressed', String(!playing));
    btn.querySelector('.sr-only')!.textContent = playing ? 'Pause background video' : 'Play background video';
  };
  const sync = () => {
    if (!video.src && !video.querySelector('source')) return;
    if (!userPaused && inView && !document.hidden) video.play().catch(() => {});
    else video.pause();
  };

  const start = () => {
    const mobile = matchMedia('(max-width: 767px)').matches;
    const d = video.dataset;
    const sources = mobile
      ? [[d.mobileWebm, 'video/webm'], [d.mobileMp4, 'video/mp4']]
      : [[d.desktopWebm, 'video/webm'], [d.desktopMp4, 'video/mp4']];
    for (const [src, type] of sources) {
      if (!src) continue;
      const s = document.createElement('source');
      s.src = src;
      s.type = type!;
      video.append(s);
    }
    if (!video.querySelector('source')) return;
    video.addEventListener('playing', () => hero.setAttribute('data-video', 'on'), { once: true, signal });
    video.load();
    btn.hidden = false;
    setBtn(true);
    sync();
  };

  btn.addEventListener('click', () => {
    userPaused = !userPaused;
    setBtn(!userPaused);
    sync();
  }, { signal });
  const io = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    sync();
  });
  io.observe(hero);
  signal.addEventListener('abort', () => io.disconnect());
  document.addEventListener('visibilitychange', sync, { signal });

  // Wait until the page (and the poster, the LCP image) has loaded, then idle.
  const later = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 600));
  if (document.readyState === 'complete') later();
  else addEventListener('load', later, { once: true, signal });
}

function initHelp(signal: AbortSignal) {
  const form = document.querySelector<HTMLFormElement>('[data-help]');
  form?.addEventListener('submit', (e) => {
    const sel = form.querySelector('select')!;
    e.preventDefault();
    if (!sel.value) return sel.focus();
    location.href = sel.value;
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

/** Marquee: pause while touched, hovered or focused (CSS handles hover/focus). */
function initMarquee(signal: AbortSignal) {
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((vp) => {
    const sec = vp.closest('section')!;
    vp.addEventListener('touchstart', () => sec.setAttribute('data-touch', ''), { passive: true, signal });
    vp.addEventListener('touchend', () => setTimeout(() => sec.removeAttribute('data-touch'), 2500), { passive: true, signal });
  });
}

function initCounters() {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!els.length || reducedMotion()) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const el = e.target as HTMLElement;
      const end = Number(el.dataset.count);
      el.textContent = '0';
      const t0 = performance.now();
      const dur = 1200;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, { threshold: 0.6 });
  els.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top > innerHeight) io.observe(el);
  });
}

function initSteps(signal: AbortSignal) {
  const sec = document.querySelector<HTMLElement>('[data-steps]');
  if (!sec) return;
  if (reducedMotion()) return sec.style.setProperty('--progress', '1');
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = sec.getBoundingClientRect();
    const p = (innerHeight * 0.85 - r.top) / (r.height * 0.9);
    sec.style.setProperty('--progress', Math.max(0, Math.min(1, p)).toFixed(3));
  };
  const onScroll = () => (raf ||= requestAnimationFrame(update));
  update();
  addEventListener('scroll', onScroll, { passive: true, signal });
  addEventListener('resize', onScroll, { passive: true, signal });
}

function initSlider(signal: AbortSignal) {
  document.querySelectorAll<HTMLElement>('[data-slider]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-slider-track]');
    if (!track) return;
    root.querySelectorAll<HTMLButtonElement>('[data-slide]').forEach((b) => {
      b.addEventListener('click', () => {
        const card = track.querySelector<HTMLElement>('li');
        const step = (card?.offsetWidth ?? track.clientWidth) + 24;
        track.scrollBy({ left: Number(b.dataset.slide) * step, behavior: reducedMotion() ? 'auto' : 'smooth' });
      }, { signal });
    });
  });
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
  initMarquee(signal);
  initCounters();
  initSteps(signal);
  initSlider(signal);
});
