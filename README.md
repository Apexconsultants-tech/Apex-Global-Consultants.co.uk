# Apex Global Consulting Services: website

Static Astro site for **apexglobalconsultants.co.uk**, deployed to HostGator (Apache + PHP) behind
Cloudflare. Design: "Summit" (Plus Jakarta Sans, logo palette in `docs/brand.md`).
Project rules for developers and AI assistants: [CLAUDE.md](CLAUDE.md).

## Run it locally

Requires Node 22 or newer.

```bash
npm ci
npm run dev        # http://localhost:4321 (also shows draft/sample content)
npm run build      # production build into dist/ (drafts hidden)
npm run preview    # serve dist/ at http://localhost:4321
npm run verify     # astro check + build + link check + performance budget
npm run check:placeholders   # lists every placeholder still to replace before go-live
```

`npm run preview` does not run PHP or `.htaccess`, so the forms and redirects only work on the server.

## Site structure

| URL | Built from |
|---|---|
| `/` | `src/pages/index.astro` + `src/components/home/*` |
| `/services/` | the 4 service areas in `src/content/service-groups/` |
| `/services/[area]/` | `src/content/service-groups/<area>.md` |
| `/services/[area]/[service]/` | `src/content/services/<service>.md` (the area lists which services it holds) |
| `/who-we-help/[audience]/` | `src/content/audiences/<audience>.md` |
| `/software/` and `/software/[name]/` | `src/content/software/<name>.yaml` |
| `/areas/` and `/areas/[town]/` | `src/content/locations/<town>.md` |
| `/insights/` and `/insights/[article]/` | `src/content/insights/<article>.md` |
| `/about/`, `/team/`, `/pricing/`, `/faq/`, `/contact/`, legal pages, `/thank-you/`, 404 | `src/pages/*.astro` |

## Editing content

All text lives in `src/content/` (Markdown or YAML with a header) or `src/data/`.

| To change | Edit |
|---|---|
| Phone, email, WhatsApp, address, hours, compliance statements, hero headline and ticks, menu | `src/data/site.ts` |
| Homepage "Why Apex", "How we work" steps, switching band | `src/data/home.ts` |
| A service area (name, one-line description, explainer, photo, which services it contains) | `src/content/service-groups/<area>.md` |
| A service page (summary, what's included, how we help, key facts, price, related) | `src/content/services/<service>.md` |
| FAQs (FAQ page, service and area pages, pricing) | `src/content/faqs/faqs.yaml`; `services: [slug]` shows a question on that service page |
| Team | `src/content/team/<name>.md` (photo in `src/assets/team/`) |
| Colours | `src/styles/base.css` (`@theme`); see `docs/brand.md`. Never add colours outside the logo palette |

YAML tip: if a value contains a colon followed by a space, wrap it in single quotes.

### Add a service

1. Copy a file in `src/content/services/` to `new-service-name.md` (the filename becomes the URL).
2. Update every field and add a photo in `src/assets/services/`.
3. Add `new-service-name` to the `services:` list of the right area in `src/content/service-groups/`.
4. Add FAQs with `services: [new-service-name]` in `faqs.yaml`.
5. Add a 301 in `public/.htaccess` if it replaces an old URL. Run `npm run verify`.
   The menu, "I need help with" selector, explorer, footer, sitemap and schema update automatically.

### Add an insight

1. Create `src/content/insights/your-article-title.md` (lowercase, hyphens, no dates).
2. Fill in `taxYear`, `published`, `reviewed`, `reviewer`, `author`, image and alt text.
3. Keep `draft: true` until a qualified reviewer has checked it, then set `draft: false`.
   Every article shows the tax year, dates, reviewer and the "general information, not advice" disclaimer.
   The homepage "Latest insights" section and the menu's featured article appear once one is published.

### Add a software page

Add `src/content/software/<name>.yaml` (copy an existing one) and the official logo in
`src/assets/software/` (transparent PNG or SVG, unaltered, per the vendor's brand guidelines).
Only set `partnerLevel` if the firm has proof of that status.

### Add an area page

Copy a file in `src/content/locations/`. Write **new** wording for each town; never copy text between towns.

### Swap images

Replace the file in `src/assets/...` with a licensed photo **using the same filename**, then update
its row in `docs/image-licenses.md`. Astro creates the AVIF/WebP sizes automatically. Never use
photos of people presented as Apex staff or clients unless they are.

### Hero video

The homepage hero shows a still (`src/assets/hero-poster.jpg`, `hero-poster-mobile.jpg`) and fades in a
silent loop from `public/media/`. The current files are a **placeholder** made from a licensed photo.
To use real footage (licensed, 1920px or wider), with ffmpeg:

```bash
# 1. Cut the best 13 s and crossfade the last second into the first so the loop is invisible
ffmpeg -ss 2 -t 13 -i source.mp4 -an -filter_complex "[0]split[a][b];[a]trim=0:12,setpts=PTS-STARTPTS[main];[b]trim=12:13,setpts=PTS-STARTPTS[end];[main][end]xfade=transition=fade:duration=1:offset=11,format=yuv420p" loop.mp4
# 2. Desktop 1920 wide (< 2.5 MB) and mobile 720x900 4:5 crop (< 1 MB)
ffmpeg -i loop.mp4 -an -vf scale=1920:-2 -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 public/media/hero-desktop.webm
ffmpeg -i loop.mp4 -an -vf scale=1920:-2 -c:v libx264 -crf 26 -preset slow -movflags +faststart public/media/hero-desktop.mp4
ffmpeg -i loop.mp4 -an -vf "crop=ih*4/5:ih,scale=720:900" -c:v libvpx-vp9 -b:v 0 -crf 40 public/media/hero-mobile.webm
ffmpeg -i loop.mp4 -an -vf "crop=ih*4/5:ih,scale=720:900" -c:v libx264 -crf 28 -preset slow -movflags +faststart public/media/hero-mobile.mp4
# 3. First frame as the stills (the poster must be under 150 KB once Astro compresses it)
ffmpeg -i loop.mp4 -frames:v 1 -vf scale=1600:-2 src/assets/hero-poster.jpg
ffmpeg -i loop.mp4 -frames:v 1 -vf "crop=ih*4/5:ih,scale=720:900" src/assets/hero-poster-mobile.jpg
```

The video never loads under reduced motion, Data Saver or slow connections, pauses off-screen and in
hidden tabs, and has a pause button. Record its licence in `docs/image-licenses.md`.

### Badges and testimonials

The collections `src/content/accreditations/` and `src/content/testimonials/` are kept for later. The
homepage sections were removed at the client's request (2026-10-31); re-add them from git history
(`BadgeSlider.astro`, `Testimonials.astro`) when real, permissioned content exists.

## Deploys

On every push to `main`, `.github/workflows/deploy.yml` runs: `npm ci` → `astro check` → build →
link check → performance budget → Lighthouse CI (/, a service page, /contact/) → saves `dist/` as an
artifact → **placeholder check** → FTPS upload of changed files → Cloudflare cache purge. Any
failure stops the deploy.

Repository: https://github.com/Apexconsultants-tech/Apex-Global-Consultants.co.uk (the only one; do not push elsewhere).

One-off setup in GitHub (Settings):
- **Secrets:** `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR` (the document root, e.g. `/public_html/`), `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN` (permission: Zone → Cache Purge).
- **Variables:** `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_CF_BEACON_TOKEN`.
- **Environments → production:** add a required reviewer so each deploy waits for approval.

Server setup (SMTP config outside the web root, PHP version, Cloudflare settings): [server/README.md](server/README.md).
Old-URL redirects: [docs/redirects.md](docs/redirects.md).

## Rollbacks

- **Quick:** GitHub → Actions → the last good run → download the `dist-<sha>` artifact, upload its
  contents to the document root over FTPS, then purge the Cloudflare cache.
- **Proper:** `git revert <bad-commit>` and push to `main`. The pipeline rebuilds and redeploys.

## Analytics and conversions

Cloudflare Web Analytics is cookieless (no cookie banner needed). It counts page views only, so form
conversions = views of `/thank-you/`; call, WhatsApp, email and booking clicks carry `data-track`
attributes and are sent to Cloudflare Zaraz (`zaraz.track`) if enabled later.
