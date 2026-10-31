// Performance budget for every built page (gzip sizes, as transferred):
// JS < 30 KB, CSS < 50 KB, LCP hero image < 150 KB, first load < 1 MB.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const KB = 1024;
const budget = { js: 30 * KB, css: 50 * KB, hero: 150 * KB, total: 1024 * KB };

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const gz = new Map();
const size = (url) => {
  const p = join(root, url.split(/[?#]/)[0]);
  if (!existsSync(p)) return 0;
  if (!gz.has(p)) {
    const buf = readFileSync(p);
    gz.set(p, /\.(js|css|html|svg)$/.test(p) ? gzipSync(buf).length : buf.length);
  }
  return gz.get(p);
};

let failed = false;
const rows = [];
for (const file of walk(root).filter((f) => f.endsWith('.html'))) {
  const page = '/' + file.slice(root.length).replace(/\\/g, '/').replace(/index\.html$/, '');
  const html = readFileSync(file, 'utf8');
  const js = [...html.matchAll(/<script[^>]+src="(\/[^"]+\.js)"/g)].map((m) => m[1]);
  // ClientRouter/prefetch import chunks: count static imports one level deep.
  const jsAll = new Set(js);
  for (const j of js) {
    const src = existsSync(join(root, j)) ? readFileSync(join(root, j), 'utf8') : '';
    for (const m of src.matchAll(/from\s*["'](\.\/[^"']+\.js)["']/g)) jsAll.add('/_astro/' + m[1].slice(2));
  }
  const css = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(\/[^"]+)"/g)].map((m) => m[1]);
  const fonts = [...html.matchAll(/<link[^>]+rel="preload"[^>]+href="(\/[^"]+\.woff2)"/g)].map((m) => m[1]);
  const lcp = html.match(/<img[^>]+fetchpriority="high"[^>]*>/)?.[0];
  // Largest eager candidate the browser could pick (desktop AVIF/WebP widest).
  let heroBytes = 0;
  if (lcp) {
    const picture = html.slice(0, html.indexOf(lcp)).split('<picture>').pop() + lcp;
    const urls = [...picture.matchAll(/(\/_astro\/[^\s",]+)/g)].map((m) => m[1]).filter((u) => /\.(avif|webp)$/.test(u));
    heroBytes = Math.max(0, ...urls.map(size));
  }
  const jsBytes = [...jsAll].reduce((a, u) => a + size(u), 0);
  const inlineCss = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('');
  const cssBytes = css.reduce((a, u) => a + size(u), 0) + gzipSync(Buffer.from(inlineCss)).length;
  const total = gzipSync(Buffer.from(html)).length + jsBytes + cssBytes + fonts.reduce((a, u) => a + size(u), 0) + heroBytes;
  const bad = jsBytes > budget.js || cssBytes > budget.css || heroBytes > budget.hero || total > budget.total;
  failed ||= bad;
  rows.push(`${bad ? '✖' : '✓'} ${page.padEnd(48)} js ${(jsBytes / KB).toFixed(1)}KB  css ${(cssBytes / KB).toFixed(1)}KB  hero ${(heroBytes / KB).toFixed(1)}KB  first-load ${(total / KB).toFixed(0)}KB`);
}
console.log(rows.sort().join('\n'));
if (failed) {
  console.error('\n✖ Performance budget exceeded');
  process.exit(1);
}
console.log('\n✓ All pages within budget');
