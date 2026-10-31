// Forms post normally to /contact.php (works without fetch). This script:
// - loads Cloudflare Turnstile only when a visitor first interacts with a form,
// - shows friendly validation messages,
// - records a conversion on submit.
import { track } from './track';

type Turnstile = { render: (el: HTMLElement, opts: Record<string, unknown>) => string };
declare global {
  interface Window { turnstile?: Turnstile; onApexTurnstile?: () => void }
}

let loading: Promise<void> | undefined;
function loadTurnstile() {
  loading ??= new Promise((resolve) => {
    window.onApexTurnstile = () => resolve();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onApexTurnstile';
    s.async = true;
    document.head.append(s);
  });
  return loading;
}

async function renderWidget(form: HTMLFormElement) {
  const slot = form.querySelector<HTMLElement>('.turnstile-slot');
  if (!slot || slot.dataset.rendered) return;
  slot.dataset.rendered = '1';
  await loadTurnstile();
  window.turnstile?.render(slot, { sitekey: slot.dataset.sitekey, theme: 'light', size: 'flexible' });
}

function message(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const name = form_label(field);
  if (field.validity.valueMissing) return `Please enter your ${name}.`;
  if (field.validity.typeMismatch && field.type === 'email') return 'Please enter a valid email address, like name@example.co.uk.';
  return `Please check your ${name}.`;
}
function form_label(field: HTMLElement) {
  const l = field.id ? document.querySelector(`label[for="${field.id}"]`) : null;
  return (l?.textContent ?? 'details').replace('*', '').replace(/\(optional\)/i, '').trim().toLowerCase();
}

// Messages for /contact/?status=... redirects from contact.php.
const statusMessages: Record<string, string> = {
  invalid: 'Some details were missing or invalid. Please check the form and try again.',
  captcha: 'We could not confirm you are not a robot. Please try again.',
  busy: 'We have received several messages from your connection recently. Please wait a few minutes, or call us.',
  error: 'Sorry, your message could not be sent. Please try again, or call or email us directly.',
};

export function initForms(signal: AbortSignal) {
  const status = new URLSearchParams(location.search).get('status');
  const box = status && statusMessages[status] ? document.querySelector<HTMLElement>('#book [data-form-error]') : null;
  if (box) {
    box.textContent = statusMessages[status!];
    box.hidden = false;
  }

  document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
    const warm = () => renderWidget(form);
    form.addEventListener('focusin', warm, { once: true, signal });
    form.addEventListener('pointerenter', warm, { once: true, signal });

    form.addEventListener('submit', (e) => {
      const errorBox = form.querySelector<HTMLElement>('[data-form-error]');
      const fields = [...form.querySelectorAll<HTMLInputElement>('input:not([type=hidden]):not([tabindex="-1"]), textarea, select')];
      const invalid = fields.filter((f) => !f.checkValidity());
      fields.forEach((f) => f.removeAttribute('aria-invalid'));
      if (invalid.length) {
        e.preventDefault();
        invalid.forEach((f) => f.setAttribute('aria-invalid', 'true'));
        if (errorBox) {
          errorBox.textContent = invalid.map(message).join(' ');
          errorBox.hidden = false;
        }
        invalid[0].focus();
        return;
      }
      const token = form.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]');
      if (!token?.value) {
        e.preventDefault();
        renderWidget(form);
        if (errorBox) {
          errorBox.textContent = 'Please wait a moment while we check you are not a robot, then press send again.';
          errorBox.hidden = false;
        }
        return;
      }
      track(`form_${form.dataset.form}`, { page: location.pathname });
      form.querySelector<HTMLButtonElement>('button[type=submit]')?.setAttribute('disabled', '');
    }, { signal });
  });
}
