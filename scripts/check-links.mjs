// Internal link checker for dist/. Fails if any internal href/src points to a file that
// does not exist, or if an internal page link breaks the trailing-slash rule.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const root = decodeURIComponent(dist.pathname).replace(/^\/(\w:)/, '$1');

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const html = walk(root).filter((f) => f.endsWith('.html'));
const errors = [];
const attr = /(?:href|src|srcset|poster)="([^"]+)"/g;

for (const file of html) {
  const page = file.slice(root.length - 1).replace(/\\/g, '/');
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(attr)) {
    const values = m[0].startsWith('srcset') ? m[1].split(',').map((s) => s.trim().split(/\s+/)[0]) : [m[1]];
    for (const raw of values) {
      if (!raw.startsWith('/') || raw.startsWith('//')) continue; // external, mailto:, tel:, #hash
      const path = decodeURIComponent(raw.split(/[?#]/)[0]);
      const isPage = !extname(path);
      if (isPage && !path.endsWith('/')) errors.push(`${page}: missing trailing slash -> ${raw}`);
      if (path !== path.toLowerCase() && isPage) errors.push(`${page}: uppercase URL -> ${raw}`);
      const target = isPage ? join(root, path, 'index.html') : join(root, path);
      if (!existsSync(target)) errors.push(`${page}: broken link -> ${raw}`);
    }
  }
}

if (errors.length) {
  console.error([...new Set(errors)].join('\n'));
  console.error(`\n✖ ${errors.length} link problem(s) across ${html.length} pages`);
  process.exit(1);
}
console.log(`✓ Internal links OK across ${html.length} pages`);
