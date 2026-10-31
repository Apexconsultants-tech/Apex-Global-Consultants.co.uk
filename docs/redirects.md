# Redirects from the old site

Implemented in `public/.htaccess` (section 3). All are permanent (301) and drop old query strings.
Old URLs were taken from the live sitemap (`/sitemap.xml`) and navigation on 2026-10-30, plus the
filenames given in the brief.

| Old URL | New URL | Source | Status |
|---|---|---|---|
| `/index.php` | `/` | brief + live | Confirmed |
| `/about.php` | `/about/` | brief + live | Confirmed |
| `/contact.php` (GET only) | `/contact/` | brief + live | Confirmed. POST still reaches the form handler |
| `/blog.php` | `/insights/` | brief + live | Confirmed |
| `/bookeeping-service.php` (also `/bookkeeping-service.php`) | `/services/bookkeeping/` | brief + live | Confirmed |
| `/accounting-advisory.php` | `/services/accounting-advisory/` | brief + live | Confirmed |
| `/accounting-application.php` | `/services/accounting-advisory/` | brief + live | Confirmed |
| `/taxation-service.php` | `/services/taxation/` | brief + live | Confirmed |
| `/payroll-processing-service.php` | `/services/payroll-processing/` | live | Confirmed (live filename differs from brief) |
| `/payroll-service.php` | `/services/payroll-processing/` | brief | Not on live sitemap; kept as a safety net |
| `/corporate-service.php` | `/services/corporate-services/` | brief + live | Confirmed |
| `/compliance-service.php` | `/services/compliance/` | brief + live | Confirmed |
| `/management-reporting-service.php` | `/services/management-reporting/` | live | Confirmed (live filename differs from brief) |
| `/management-reporting.php` | `/services/management-reporting/` | brief | Not on live sitemap; kept as a safety net |
| `/specialized-service.php` | `/services/specialised-support/` | live | Confirmed (live filename differs from brief) |
| `/specialized-support.php` | `/services/specialised-support/` | brief | Not on live sitemap; kept as a safety net |
| `/services.php`, `/service.php` | `/services/` | live | **Please confirm** |
| `/new_highlights.php` | `/insights/` | live | **Please confirm** |
| `/careers.php` | `/about/` | live | **Please confirm** (no careers page on new site) |
| `/privacy-policy.php` | `/privacy/` | live | **Please confirm** |
| `/terms-condition.php` | `/terms/` | live | **Please confirm** |
| `/blogs-detail.php?id=2, 4, 5, 6, 11, 12` | `/insights/` | live sitemap | **Please confirm**. If any post is moved to the new site, add a specific rule above the generic one |

Host-level: `http://` → `https://` and `www.` → bare domain.

## Checking after go-live

```
curl -sI https://apexglobalconsultants.co.uk/about.php | grep -i location
curl -sI "https://www.apexglobalconsultants.co.uk/blogs-detail.php?id=12" | grep -i location
```

Then submit the new sitemap in Google Search Console and watch the "Pages" report for 404s.
