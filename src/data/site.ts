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
  // Shown under the logo in the header and footer.
  serviceLine: ['Tax', 'Accounting', 'Assurance', 'Consulting'],
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
  // Registered office at Companies House (differs from the trading office above).
  registeredOffice: 'Office 5793, Peregrine Road, Ilford, England, IG6 3SZ',
  icoNumber: 'ZB825809',
  geo: { lat: 53.3978, lng: -2.36 }, // approximate: Atlantic Street, Altrincham (centre of the contact page map)
  phone: { display: '+44 (0) 204 553 8806', tel: '+442045538806' },
  email: 'info@apexglobalconsultants.co.uk',
  whatsapp: {
    // Digits only, international format without + (e.g. 447700900000).
    number: '447777622790',
    display: '+44 7777 622790',
  },
  social: [
    // Public profile URLs only. An empty list hides the icons.
    // { name: 'LinkedIn', url: 'https://www.linkedin.com/company/...' },
  ] as { name: 'LinkedIn' | 'Facebook' | 'Instagram' | 'X'; url: string }[],
  hours: 'Monday to Friday, 9:00 to 17:30',
  compliance: {
    amlSupervisorName: 'the Institute of Accountants and Bookkeepers (IAB)',
    amlSupervisor:
      'Apex Global Consulting Services Limited is supervised for anti-money laundering purposes by the Institute of Accountants and Bookkeepers (IAB).',
    professionalBody:
      'Our director, Sandeep Kumar, is a Fellow of the Institute of Chartered Accountants of Pakistan (FCA, ICAP) and a member of the Association of Chartered Certified Accountants (ACCA).',
    // Professional indemnity insurance: add insurer and territory here when the client confirms them,
    // and restore the row on the About page.
  },
  hero: {
    // The visual beside the headline is HeroScene.astro (animated, no media files).
    // Headline: clear about what we do, with a confident, premium tone. No "best"/"top" claims.
    title: 'Accounting and tax,',
    titleAccent: 'handled with precision.',
    line: 'One dedicated accountant for your books, payroll, tax and reporting, at a fixed fee agreed before we start.',
    points: ['Fixed fees', 'UK and overseas companies', 'Cloud accounting set up for you'],
  },
} as const;

export const whatsappHref = `https://wa.me/${site.whatsapp.number}`;
export const telHref = `tel:${site.phone.tel}`;
export const mailHref = `mailto:${site.email}`;
/** "File your tax return" buttons: the contact form with Taxation preselected (forms.ts). */
export const taxReturnHref = '/contact/?service=Taxation&subject=Tax%20return#book';
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
  { label: 'Pricing', href: '/pricing/' },
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
