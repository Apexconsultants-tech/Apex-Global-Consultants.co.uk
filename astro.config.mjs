// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://apexglobalconsultants.co.uk',
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'always' },
  // Self-hosted variable fonts (latin subset) with metric-matched fallbacks: no layout shift on swap.
  // Each page loads at most two of these. Preview 1: Source Serif 4 + Inter. Preview 2: Plus Jakarta Sans.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-inter',
      fallbacks: ['Arial', 'sans-serif'],
      options: { variants: [{ src: ['./src/assets/fonts/inter-var.woff2'], weight: '100 900', style: 'normal', display: 'swap' }] },
    },
    {
      provider: fontProviders.local(),
      name: 'Source Serif 4',
      cssVariable: '--font-serif4',
      fallbacks: ['Georgia', 'serif'],
      options: { variants: [{ src: ['./src/assets/fonts/source-serif-4-var.woff2'], weight: '200 900', style: 'normal', display: 'swap' }] },
    },
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
