# Server setup (one-off, in Hostinger hPanel)

This folder is **not deployed**. It documents files that live on the server outside the web root.

Hosting: Hostinger shared hosting (LiteSpeed, Apache-compatible `.htaccess`, PHP) behind Cloudflare.
Document root: `domains/apexglobalconsultants.co.uk/public_html`. GitHub Actions uploads `dist/` there
over FTPS on every push to `main`.

## 1. Mailboxes

- `website@apexglobalconsultants.co.uk`: dedicated sending mailbox used only by the contact form
  (hPanel → Emails → Email Accounts). Its password goes in the private config below.
- `info@apexglobalconsultants.co.uk`: receives every enquiry. The enquiry's Reply-To is the visitor's
  email, so staff can reply directly; the visitor's auto-reply has `info@` as Reply-To.

## 2. Private config for the contact form

1. In hPanel → Files → File Manager, open `domains/apexglobalconsultants.co.uk/` (the folder that
   *contains* `public_html`).
2. Create a folder `apex-private` (permissions 700).
3. Upload `smtp-config.sample.php` into it, rename it `smtp-config.php` and fill in:
   - the password of the `website@` mailbox (host `smtp.hostinger.com`, port 465, SSL are preset),
   - the Cloudflare Turnstile **secret** key (Cloudflare → Turnstile → your widget).
4. Set permissions on `smtp-config.php` to 600.

`public/contact.php` reads `dirname(__DIR__) . '/apex-private/smtp-config.php'`, i.e.
`domains/apexglobalconsultants.co.uk/apex-private/smtp-config.php`. If the document root ever moves,
change `APEX_CONFIG` at the top of `contact.php` to the correct absolute path.

The rate limiter writes small files to `apex-private/rate-limit/`. It creates the folder itself.

## 3. PHP version

`contact.php` needs PHP 8.0 or newer with the `curl` and `mbstring` extensions
(hPanel → Advanced → PHP Configuration). PHPMailer 7.1.1 is bundled in `public/_lib/phpmailer/` (LGPL-2.1).

## 4. Cloudflare settings

- SSL/TLS mode: **Full (strict)**.
- Turn **off** Rocket Loader and Email Address Obfuscation (they inject scripts that the CSP blocks
  and can break `mailto:` links).
- Turnstile: add `apexglobalconsultants.co.uk` as a hostname; put the **site key** in the GitHub
  repository variable `PUBLIC_TURNSTILE_SITE_KEY`.
- Web Analytics: add the site; put the token in the GitHub variable `PUBLIC_CF_BEACON_TOKEN`.
- If Hostinger's own CDN is enabled in hPanel, turn it off so Cloudflare is the only cache.

## 5. Deploys and backups

Before a major change, download a backup of `public_html` (hPanel → Files → Backups). The deploy
uploads changed files only and never deletes anything it did not upload. Old `.php` pages from the
previous site stay on the server but are never reached, because `.htaccess` redirects them first.
