# Server setup (one-off, in cPanel)

This folder is **not deployed**. It documents files that live on the server outside the web root.

## 1. Private config for the contact form

1. In cPanel File Manager, go to your home folder (the folder that *contains* `public_html`).
2. Create a folder `apex-private` (permissions 700).
3. Upload `smtp-config.sample.php` into it, rename it `smtp-config.php` and fill in:
   - the SMTP details for `info@apexglobalconsultants.co.uk` (cPanel → Email Accounts → Connect Devices),
   - the Cloudflare Turnstile **secret** key (Cloudflare → Turnstile → your widget).
4. Set permissions on `smtp-config.php` to 600.

`public/contact.php` reads `dirname(__DIR__) . '/apex-private/smtp-config.php'`. If the site's
document root is not directly inside your home folder, change `APEX_CONFIG` at the top of
`contact.php` to the correct absolute path.

The rate limiter writes small files to `apex-private/rate-limit/`. It creates the folder itself.

## 2. PHP version

`contact.php` needs PHP 8.0 or newer with the `curl` and `mbstring` extensions
(cPanel → Select PHP Version). PHPMailer 7.1.1 is bundled in `public/_lib/phpmailer/` (LGPL-2.1).

## 3. Cloudflare settings

- SSL/TLS mode: **Full (strict)**.
- Turn **off** Rocket Loader and Email Address Obfuscation (they inject scripts that the CSP blocks
  and can break `mailto:` links).
- Turnstile: add `apexglobalconsultants.co.uk` as a hostname; put the **site key** in the GitHub
  repository variable `PUBLIC_TURNSTILE_SITE_KEY`.
- Web Analytics: add the site; put the token in the GitHub variable `PUBLIC_CF_BEACON_TOKEN`.

## 4. First deploy

Before the first automated deploy, download a full backup of `public_html` from cPanel. The deploy
uploads the new files over the old site. Old `.php` pages stay on the server but are never reached,
because `.htaccess` redirects them first. Delete them by hand once the redirects are confirmed.
