// Blocks a production deploy while placeholder content is still in the built site.
// Run after `astro build`. Lists every page and marker so they can be fixed.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const markers = [
  [/\[TO VERIFY\]|TO-VERIFY/g, 'TO VERIFY marker'],
  [/£X\b/g, 'price placeholder (£X)'],
  [/1x00000000000000000000AA/g, 'Cloudflare Turnstile TEST site key'],
  [/PLACEHOLDER ·/g, 'placeholder image label'],
  [/Sample (body|testimonial|badge)/g, 'sample content'],
];

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const found = new Map();
for (const file of walk(root).filter((f) => /\.(html|xml|txt)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  for (const [re, label] of markers) {
    const n = text.match(re)?.length ?? 0;
    if (n) found.set(`${label}`, [...(found.get(label) ?? []), `${file.slice(root.length).replace(/\\/g, '/')} (${n})`]);
  }
}
// Generated placeholder images are tracked in docs/image-licenses.md (rows marked PLACEHOLDER).
const licences = readFileSync(fileURLToPath(new URL('../docs/image-licenses.md', import.meta.url)), 'utf8');
const placeholderImages = [...licences.matchAll(/^\| `([^`]+)` \| PLACEHOLDER/gm)].map((m) => m[1]);
if (placeholderImages.length) found.set('generated placeholder images (see docs/image-licenses.md)', placeholderImages);

if (!process.env.PUBLIC_CF_BEACON_TOKEN) found.set('Cloudflare Web Analytics token not set (PUBLIC_CF_BEACON_TOKEN)', ['build env']);

if (found.size) {
  for (const [label, where] of found) console.error(`✖ ${label}:\n   ${where.join('\n   ')}`);
  console.error('\nPlaceholder content remains. Replace it before deploying to production.');
  process.exit(1);
}
console.log('✓ No placeholder content found');
