import type { APIRoute } from 'astro';

// Netlify builds are previews only (production is HostGator), so they are kept out of search.
const isPreview = process.env.NETLIFY === 'true';

export const GET: APIRoute = ({ site }) => {
  const body = isPreview
    ? 'User-agent: *\nDisallow: /\n'
    : [
        'User-agent: *',
        'Allow: /',
        'Disallow: /thank-you/',
        'Disallow: /_lib/',
        '',
        `Sitemap: ${new URL('sitemap-index.xml', site)}`,
        '',
      ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
