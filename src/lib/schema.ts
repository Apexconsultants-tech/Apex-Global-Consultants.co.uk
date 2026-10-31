import { site } from '../data/site';

const orgId = `${site.url}/#organization`;

export function organizationSchema(logoUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': ['AccountingService', 'LocalBusiness'],
    '@id': orgId,
    name: site.legalName,
    alternateName: site.name,
    slogan: site.tagline,
    url: `${site.url}/`,
    logo: logoUrl,
    image: logoUrl,
    telephone: site.phone.tel,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.line1}, ${site.address.street}`,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postcode,
      addressCountry: site.address.countryCode,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: [{ '@type': 'Country', name: 'United Kingdom' }, 'Worldwide'],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:30',
    },
    identifier: { '@type': 'PropertyValue', propertyID: 'Companies House', value: site.companyNumber },
    sameAs: site.social.map((s) => s.url),
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: new URL(it.href, site.url).href,
    })),
  };
}

export function serviceSchema(s: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    description: s.description,
    url: s.url,
    serviceType: s.name,
    provider: { '@id': orgId },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function articleSchema(a: {
  title: string; description: string; url: string; image: string;
  published: Date; reviewed: Date; author: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    mainEntityOfPage: a.url,
    image: a.image,
    datePublished: a.published.toISOString(),
    dateModified: a.reviewed.toISOString(),
    author: { '@type': 'Person', name: a.author },
    publisher: { '@id': orgId },
  };
}

export function personSchema(p: { name: string; role: string; image?: string; url: string; sameAs?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    jobTitle: p.role,
    image: p.image,
    url: p.url,
    worksFor: { '@id': orgId },
    sameAs: p.sameAs ? [p.sameAs] : undefined,
  };
}
