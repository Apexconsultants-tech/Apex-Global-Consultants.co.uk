// Conversion events (call, WhatsApp, email, booking, form submit).
// Cloudflare Web Analytics records page views only; it has no custom events.
// Events are forwarded to Cloudflare Zaraz if it is enabled later (zaraz.track),
// and always dispatched as a DOM event so any future tool can listen for them.
// Form conversions are also measurable today as page views of /thank-you/.
type Zaraz = { track: (name: string, props?: Record<string, string>) => void };

export function track(name: string, props: Record<string, string> = {}) {
  const z = (window as Window & { zaraz?: Zaraz }).zaraz;
  try {
    z?.track(`conversion_${name}`, props);
  } catch {
    /* analytics must never break the page */
  }
  document.dispatchEvent(new CustomEvent('apex:conversion', { detail: { name, ...props } }));
}
