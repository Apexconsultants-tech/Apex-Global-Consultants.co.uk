// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://apexglobalconsultants.co.uk',
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'always' },
  // One self-hosted variable font (Plus Jakarta Sans, latin subset, SIL OFL) with a metric-matched
  // fallback, so swapping in causes no layout shift. Preloaded once in BaseLayout.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-jakarta',
      fallbacks: ['Arial', 'sans-serif'],
      options: { variants: [{ src: ['./src/assets/fonts/plus-jakarta-sans-var.woff2'], weight: '200 800', style: 'normal', display: 'swap' }] },
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
