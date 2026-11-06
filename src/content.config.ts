import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const iconNames = [
  'ledger', 'receipt', 'bank', 'invoice', 'scales', 'lease', 'leaf', 'chart', 'percent', 'calculator',
  'payslip', 'calendar', 'building', 'register', 'shield', 'clipboard', 'search', 'trend', 'target',
  'cloud', 'model', 'compass', 'globe', 'users', 'clock', 'pound', 'chat', 'check', 'file', 'lock',
] as const;
export const IconName = z.enum(iconNames);

const seo = {
  seoTitle: z.string().max(65).optional(),
  seoDescription: z.string().min(70).max(165),
};

const services = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      order: z.number(),
      icon: IconName,
      summary: z.string().max(140),
      menuBlurb: z.string().max(80),
      image: image(),
      imageAlt: z.string(),
      included: z.array(z.object({ title: z.string(), text: z.string(), icon: IconName })).min(3),
      howWeHelp: z.array(z.object({ title: z.string(), text: z.string(), image: image(), imageAlt: z.string() })).min(2),
      keyFacts: z.array(z.object({ value: z.string(), label: z.string() })).min(3).max(4),
      // Starting price shown on /pricing/ and the service page (client price list, November 2026).
      price: z.object({
        from: z.boolean().default(true), // false: a fixed price rather than "From"
        amount: z.string(),
        unit: z.string(), // "month", "return", "hour"...
        detail: z.string().optional(),
        blurb: z.string().max(90),
        rows: z.array(z.object({ label: z.string(), amount: z.string(), unit: z.string() })).optional(),
        features: z.array(z.string()).max(4).default([]),
      }),
      priceNote: z.string(),
      related: z.array(reference('services')).max(3),
      ...seo,
    }),
});

const audiences = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/audiences' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      shortTitle: z.string(),
      order: z.number(),
      summary: z.string().max(160),
      image: image(),
      imageAlt: z.string(),
      promise: z.string().max(110),
      benefits: z.array(z.string()).length(3),
      challenges: z.array(z.string()).min(3),
      services: z.array(reference('services')).min(2),
      ...seo,
    }),
});

const faqs = defineCollection({
  loader: file('./src/content/faqs/faqs.yaml'),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    topic: z.enum(['general', 'fees', 'getting-started', 'overseas', 'tax', 'individuals', 'payroll', 'companies', 'service']),
    services: z.array(z.string()).default([]),
    audiences: z.array(z.string()).default([]),
    order: z.number().default(100),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/team' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      qualifications: z.string().optional(),
      photo: image().optional(),
      photoAlt: z.string().optional(),
      linkedin: z.url().optional(),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    jobTitle: z.string(),
    company: z.string(),
    service: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const accreditations = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/accreditations' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      certificate: z.string(),
      membershipNumber: z.string(),
      verifyUrl: z.url(),
      logo: image(),
      caption: z.string(),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

// Accounting software the firm works with (homepage showcase and /software/[slug]/).
const software = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/software' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      logo: image(),
      logoShape: z.enum(['round', 'wide']).default('wide'),
      caption: z.string(),
      // Only set when the client supplies proof of the partner/certification level.
      partnerLevel: z.string().optional(),
      help: z.string(),
      benefits: z.array(z.string()).length(3),
      // Which dashboard view the illustrated mock-up shows for this tab.
      mock: z.enum(['bank', 'invoices', 'payroll', 'vat']),
      forWho: z.string().max(200),
      seoDescription: z.string().min(70).max(165),
      order: z.number().default(100),
    }),
});

// The four service areas used by the menu, homepage explorer and /services/[group]/ hubs.
const serviceGroups = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/service-groups' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      number: z.string(),
      order: z.number(),
      oneLine: z.string().max(90),
      seoTitle: z.string().max(65).optional(),
      explainer: z.string().max(420),
      forWho: z.string().max(160),
      image: image(),
      imageAlt: z.string(),
      services: z.array(reference('services')).min(1),
      featuredInsight: reference('insights').optional(),
      seoDescription: z.string().min(70).max(165),
    }),
});

const insights = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/insights' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      seoTitle: z.string().max(65).optional(),
      description: z.string().min(70).max(165),
      taxYear: z.string(),
      published: z.coerce.date(),
      reviewed: z.coerce.date(),
      reviewer: z.string(),
      author: z.string(),
      image: image(),
      imageAlt: z.string(),
      topics: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

// Local pages (/areas/[town]/). Every town needs its own wording: never copy text between towns.
const locations = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/locations' }),
  schema: ({ image }) =>
    z.object({
      town: z.string(),
      order: z.number(),
      headline: z.string().max(90),
      summary: z.string().max(200),
      image: image(),
      imageAlt: z.string(),
      focus: z.array(z.object({ title: z.string(), text: z.string() })).length(3),
      services: z.array(reference('services')).min(3).max(4),
      seoDescription: z.string().min(70).max(165),
    }),
});

export const collections = { locations, 'service-groups': serviceGroups, services, audiences, faqs, team, testimonials, accreditations, software, insights };
