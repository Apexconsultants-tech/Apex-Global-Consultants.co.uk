// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://apexglobalconsultants.co.uk',
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'always' },
  // One self-hosted variable font (Plus Jakarta Sans, latin subset, SIL OFL), preloaded once in
  // BaseLayout, with a metric-matched fallback. display: 'optional' means the font is used when it
  // arrives in time for first paint (almost always, as it is preloaded) and is never swapped in later,
  // so text never moves (CLS 0, required by Lighthouse CI). Later pages use the cached font.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-jakarta',
      fallbacks: ['Arial', 'sans-serif'],
      options: { variants: [{ src: ['./src/assets/fonts/plus-jakarta-sans-var.woff2'], weight: '200 800', style: 'normal', display: 'optional' }] },
    },
  ],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(thank-you|404|preview-\d)\/?$/.test(page),
    }),
  ],
  image: { responsiveStyles: false },
  // Never inline scripts: keeps the CSP strict (script-src 'self').
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
});
