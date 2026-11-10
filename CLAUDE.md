# Project rules: Apex Global Consulting Services website

## Before any change
- Read this entire CLAUDE.md before making any change, every session, no exceptions.
- The site must stay fully static Astro, compatible with Hostinger shared hosting (Apache/LiteSpeed +
  PHP only, no Node runtime, no SSR, no API routes, no databases).
- All images must be stored in `src/assets` and rendered with Astro `Image`/`Picture`. Never hotlink
  external images.
- Do not add React, heavy libraries, third-party widgets or tracking scripts without asking first.
- Never rename or remove a live URL without adding a 301 redirect in `public/.htaccess`.
- Never commit secrets or passwords.
- Before committing, run `npm run build`, `astro check`, `npm run check:links` and
  `npm run check:budget` (all four: `npm run verify`), and fix every error. Only push to `main` when
  all checks pass, because pushing to `main` deploys to the live site automatically.
- If a requested change conflicts with these rules, stop and explain before doing it.
- Commits show only the repo owner as author. Never add Co-Authored-By, Claude, Anthropic or
  session-link lines. Commit messages are short, plain and in past tense, like 'Updated pricing
  table' or 'Fixed mobile menu'.

One business, one domain: apexglobalconsultants.co.uk, an accounting, tax and financial reporting firm.
No subdomains, no chooser page, no second business.

## Stack
Astro (static only), TypeScript, Tailwind CSS v4, vanilla JS. No React, no SSR, no API routes, no
animation or smooth-scroll libraries. Hostinger shared hosting (hPanel, LiteSpeed/Apache-compatible
`.htaccess` + PHP) behind Cloudflare. Document root: `domains/apexglobalconsultants.co.uk/public_html`.
GitHub Actions deploys `dist/` there over FTPS on every push to `main`; never touch other folders on
the account. Private SMTP config lives in `apex-private/` one level above `public_html`.

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
Always `src/assets` + Astro `Image`/`Picture`. Width and height always set; LCP image eager +
`fetchpriority="high"`, everything else lazy. Licensed images only; record every file in
`docs/image-licenses.md`. The homepage hero is an animated HTML/SVG/CSS scene (`HeroScene.astro`), not a
photo or video; no autoplay video anywhere. Maps load on click.

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
Turnstile, honeypot, rate limit), sending through the `website@apexglobalconsultants.co.uk` mailbox
and delivering enquiries to `info@apexglobalconsultants.co.uk` with the visitor's email as Reply-To.
SMTP config lives outside the web root and never in git. Never collect
UTR, NI numbers, bank details or documents through forms.

## Workflow
Run `npm run verify` before saying a task is done. Commit after each working change with a clear
message. The ONLY repository is https://github.com/Apexconsultants-tech/Apex-Global-Consultants.co.uk
(remote `origin`). Never push to any other repository (the old Apex-Global-Consultants.co.pk repo is retired).
A push to `main` runs the deploy pipeline to apexglobalconsultants.co.uk.
