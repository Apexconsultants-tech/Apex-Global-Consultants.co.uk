// Site-wide behaviour. Re-initialised on every astro:page-load (View Transitions);
// listeners are tied to an AbortController so nothing leaks between pages.
import { track } from './track';
import { initForms } from './forms';

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function initHeader(signal: AbortSignal) {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const update = () => header.toggleAttribute('data-scrolled', scrollY > 40);
  update();
  addEventListener('scroll', update, { passive: true, signal });
}

function initMega(signal: AbortSignal) {
  const toggle = document.querySelector<HTMLButtonElement>('[data-mega-toggle]');
  const mega = document.querySelector<HTMLElement>('[data-mega]');
  if (!toggle || !mega) return;
  const item = toggle.closest('li')!;
  let closeTimer = 0;

  const open = () => {
    clearTimeout(closeTimer);
    if (!mega.hidden) return;
    mega.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => mega.setAttribute('data-open', ''));
  };
  const close = (focusToggle = false) => {
    if (mega.hidden) return;
    mega.removeAttribute('data-open');
    toggle.setAttribute('aria-expanded', 'false');
    mega.hidden = true;
    if (focusToggle) toggle.focus();
  };
  const hoverable = matchMedia('(hover: hover) and (pointer: fine)');

  toggle.addEventListener('click', () => (mega.hidden ? open() : close()), { signal });
  for (const el of [item, mega]) {
    el.addEventListener('pointerenter', () => hoverable.matches && open(), { signal });
    el.addEventListener('pointerleave', () => {
      if (hoverable.matches) closeTimer = window.setTimeout(() => close(), 220);
    }, { signal });
  }
  document.addEventListener('keydown', (e) => e.key === 'Escape' && !mega.hidden && close(true), { signal });
  document.addEventListener('focusin', (e) => {
    const t = e.target as Node;
    if (!mega.hidden && !mega.contains(t) && !item.contains(t)) close();
  }, { signal });
  document.addEventListener('click', (e) => {
    const t = e.target as Node;
    if (!mega.hidden && !mega.contains(t) && !item.contains(t)) close();
  }, { signal });

  // Hover or focus a group: show its description, services and featured insight.
  const links = mega.querySelectorAll<HTMLAnchorElement>('[data-mega-group]');
  const panels = mega.querySelectorAll<HTMLElement>('[data-mega-panel]');
  const show = (id: string) => {
    links.forEach((l) => l.dataset.megaGroup === id ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current'));
    panels.forEach((p) => (p.hidden = p.dataset.megaPanel !== id));
  };
  links.forEach((l) => {
    l.addEventListener('pointerenter', () => show(l.dataset.megaGroup!), { signal });
    l.addEventListener('focus', () => show(l.dataset.megaGroup!), { signal });
  });
}

function initMobileMenu(signal: AbortSignal) {
  const dlg = document.querySelector<HTMLDialogElement>('[data-menu]');
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!dlg || !btn) return;
  btn.addEventListener('click', () => {
    dlg.showModal();
    btn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
  }, { signal });
  dlg.querySelector('[data-menu-close]')?.addEventListener('click', () => dlg.close(), { signal });
  dlg.addEventListener('close', () => {
    btn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  }, { signal });
  dlg.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) dlg.close();
  }, { signal });
}

/** Pause/play buttons for moving content (ribbon, badges). Pressed = paused. */
function initMotionToggles(signal: AbortSignal) {
  document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]').forEach((b) => {
    const target = b.closest('section, [data-ribbon]') as HTMLElement | null;
    b.addEventListener('click', () => {
      const paused = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(paused));
      target?.toggleAttribute('data-paused', paused);
      const label = b.querySelector('.sr-only');
      if (label) label.textContent = label.textContent!.replace(paused ? /^Pause/ : /^Play/, paused ? 'Play' : 'Pause');
    }, { signal });
  });
}

function initTracking(signal: AbortSignal) {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
    if (a) track(a.dataset.track!, { page: location.pathname });
  }, { signal });
}

function initDialogs(signal: AbortSignal) {
  document.querySelectorAll<HTMLButtonElement>('[data-dialog-open]').forEach((b) => {
    b.addEventListener('click', () => {
      document.getElementById(b.dataset.dialogOpen!)?.closest('dialog')?.showModal();
    }, { signal });
  });
  document.querySelectorAll<HTMLDialogElement>('dialog:not([data-menu])').forEach((d) => {
    // Click on the backdrop closes the dialog.
    d.addEventListener('click', (e) => e.target === d && d.close(), { signal });
  });
}

let ctrl: AbortController | undefined;
document.addEventListener('astro:page-load', () => {
  ctrl?.abort();
  ctrl = new AbortController();
  const { signal } = ctrl;
  initHeader(signal);
  initMega(signal);
  initMobileMenu(signal);
  initMotionToggles(signal);
  initTracking(signal);
  initDialogs(signal);
  initForms(signal);
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())));
});
