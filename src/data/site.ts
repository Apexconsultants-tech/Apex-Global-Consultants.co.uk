/**
 * Firm-wide facts. This is the ONLY place contact details live.
 * Anything marked TO VERIFY / TO-VERIFY is caught by `npm run check:placeholders`,
 * which blocks production deploys until real values are in.
 */
export const site = {
  url: 'https://apexglobalconsultants.co.uk',
  name: 'Apex Global',
  legalName: 'Apex Global Consulting Services Limited',
  tagline: 'Beyond numbers. Beyond borders.',
  companyNumber: '15905648',
  registration: 'Registered in England and Wales under the Companies Act 2006',
  registeredIn: 'England and Wales',
  address: {
    line1: 'Office No. 79, Atlantic Business Centre',
    street: 'Atlantic Street',
    locality: 'Altrincham',
    region: 'Greater Manchester',
    postcode: 'WA14 5NQ',
    country: 'United Kingdom',
    countryCode: 'GB',
  },
  geo: { lat: 53.3936, lng: -2.3586 }, // approximate: Atlantic Street, Altrincham
  phone: { display: '+44 (0) 204 553 8806', tel: '+442045538806' },
  email: 'info@apexglobalconsultants.co.uk',
  whatsapp: {
    // Digits only, international format without + (e.g. 447700900000).
    number: '447777622790',
    display: '+44 7777 622790',
  },
  clientPortalUrl: '/contact/#client-portal-TO-VERIFY',
  social: [
    // Public profile URLs only. An empty list hides the icons.
    // { name: 'LinkedIn', url: 'https://www.linkedin.com/company/...' },
  ] as { name: 'LinkedIn' | 'Facebook' | 'Instagram' | 'X'; url: string }[],
  hours: 'Monday to Friday, 9:00 to 17:30',
  compliance: {
    amlSupervisor: '[TO VERIFY] anti-money-laundering supervisory body',
    professionalBody: '[TO VERIFY] professional body membership, if any',
    piInsurer: '[TO VERIFY] professional indemnity insurer',
    piTerritory: '[TO VERIFY] territorial coverage of PI insurance',
  },
  hero: {
    // Silent 12 s loop in public/media (README: "Hero video"). Current files are a licensed
    // PLACEHOLDER made from src/assets/hero/scene-team.jpg until the client supplies footage.
    // Headline: clear about what we do, with a confident, premium tone. No "best"/"top" claims.
    title: 'Accounting and tax,',
    titleAccent: 'handled with precision.',
    line: 'One dedicated accountant for your books, payroll, tax and reporting, at a fixed fee agreed before we start.',
    points: ['Fixed fees, VAT shown upfront', 'UK and overseas companies', 'Cloud accounting set up for you'],
    video: {
      desktop: { webm: '/media/hero-desktop.webm', mp4: '/media/hero-desktop.mp4' },
      mobile: { webm: '/media/hero-mobile.webm', mp4: '/media/hero-mobile.mp4' },
    },
  },
} as const;

export const whatsappHref = `https://wa.me/${site.whatsapp.number}`;
export const telHref = `tel:${site.phone.tel}`;
export const mailHref = `mailto:${site.email}`;
// Standard UK order: office, street, town, county, postcode, country.
export const addressLines = [
  site.address.line1,
  site.address.street,
  site.address.locality,
  site.address.region,
  site.address.postcode,
  site.address.country,
];

export const env = {
  // Cloudflare's always-pass test key is used until a real key is set; check:placeholders flags it.
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
  cfBeaconToken: import.meta.env.PUBLIC_CF_BEACON_TOKEN || '',
};

export const mainNav = [
  { label: 'Services', href: '/services/', mega: true },
  { label: 'Who We Help', href: '/who-we-help/' },
  { label: 'Software', href: '/software/' },
  { label: 'Insights', href: '/insights/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

/** Local pages (/areas/[town]/). CLIENT TO CONFIRM the towns served. */
export const areas = ['Altrincham', 'Manchester', 'Sale', 'Stockport', 'Trafford', 'Cheshire'];

export const quickLinks = [
  { label: 'About', href: '/about/' },
  { label: 'Team', href: '/team/' },
  { label: 'Careers', href: '/careers/' },
  { label: 'Pricing', href: '/pricing/' },
  { label: 'Insights', href: '/insights/' },
  { label: 'Contact', href: '/contact/' },
];

export const legalLinks = [
  { label: 'Privacy', href: '/privacy/' },
  { label: 'Terms', href: '/terms/' },
  { label: 'Complaints', href: '/complaints/' },
  { label: 'Accessibility', href: '/accessibility/' },
  { label: 'Sitemap', href: '/sitemap-index.xml' },
];
