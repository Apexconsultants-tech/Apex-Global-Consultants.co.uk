# Project rules: Apex Global Consulting Services website

One business, one domain: apexglobalconsultants.co.uk, an accounting, tax and financial reporting firm.
No subdomains, no chooser page, no second business.

## Stack
Astro (static only), TypeScript, Tailwind CSS v4, vanilla JS. No React, no SSR, no API routes, no
animation or smooth-scroll libraries. HostGator shared hosting (Apache + PHP) behind Cloudflare.
Deploys to the document root only; never touch other folders on the account.

## Design (chosen: "Summit")
- Colours come only from the Apex logo palette in `src/styles/base.css` (`@theme`, see `docs/brand.md`).
  Sky blue #13B5EA and green #39B304 are never text on white. Each service area has a tone
  (`data-tone`: blue-deep, blue, green-deep, green).
- One font (Plus Jakarta Sans, self-hosted, one preload). 20px card radius, pill buttons, one shadow,
  24px line icons (`src/components/ui/Icon.astro`).
- Footer is light and minimal (logo, services, company, contact, legal line). No client portal link
  in the header. No scrolling text bands, testimonials or badge sliders unless the client asks.
- Logo: `src/assets/brand/apex-logo.png` via `Logo.astro`, original colours, on white or a light tint only.
- Original design only; never copy competitor sites (bkl, fusionaccountants, etc.).

## Content
Lives in `src/content` (service-groups, services, audiences, software, faqs, team, testimonials,
accreditations, insights, locations) and `src/data`. Never hard-code service, team or FAQ text in components.
Real testimonials and accreditations only. No "best", "top", "financial planning" or guaranteed-savings
claims. Titles like "Chartered Accountants", body logos or partner levels only with client proof.
Placeholders are marked `[TO VERIFY]`, `TO-VERIFY` or `£X`; `npm run check:placeholders` blocks deploys.
`draft: true` entries show in `npm run dev` only.

## Images and media
Always `src/assets` + Astro `Image`/`Picture` (the homepage hero `<picture>` from `getImage()` is the one
exception, for art direction). Width and height always set; LCP image eager + `fetchpriority="high"`,
everything else lazy. Licensed images only; record every file in `docs/image-licenses.md`.
Only one autoplay video (the muted hero loop). Maps load on click.

## Performance budget (enforced by `npm run check:budget`)
JS < 30 KB, CSS < 50 KB, hero image < 150 KB, first load < 1 MB per page (gzip). Lighthouse mobile 95+,
CLS 0. Do not add a dependency or third-party script without asking.

## URLs and SEO
Lowercase, hyphenated, trailing slash, `build.format: 'directory'`. Services live at
`/services/[area]/[service]/`. Never rename a live URL without a 301 in `public/.htaccess` and a row in
`docs/redirects.md`. Every page needs a unique title, description, canonical and the right JSON-LD
(`src/lib/schema.ts`).

## Accessibility
WCAG 2.2 AA, `lang="en-GB"`. Respect prefers-reduced-motion. Pause controls on moving content. Label
every form field. Tap targets at least 44px. Test at 360, 390, 768, 1024, 1280 and 1440+ px with no
horizontal scroll.

## Security and forms
Scripts are never inlined (CSP `script-src 'self'`); only JSON-LD and the analytics beacon may be inline.
Scripts re-initialise on `astro:page-load` (View Transitions). Forms post to `/contact.php` (PHPMailer,
Turnstile, honeypot, rate limit); SMTP config lives outside the web root and never in git. Never collect
UTR, NI numbers, bank details or documents through forms.

## Workflow
Run `npm run verify` before saying a task is done. Commit after each working change with a clear
message. Work happens on the `redesign` branch until the client approves go-live; a push to `main` deploys.
