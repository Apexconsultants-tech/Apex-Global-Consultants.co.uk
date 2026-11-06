import { getCollection, type CollectionEntry } from 'astro:content';

/** Drafts (samples, unreviewed articles) are visible in `npm run dev` only, never in a build. */
export const showDrafts = import.meta.env.DEV;
const live = <T extends { data: { draft?: boolean } }>(e: T) => showDrafts || !e.data.draft;
/** Design previews (noindex, not in the sitemap) show samples so every section can be judged. */
const pick = (withSamples = false) => <T extends { data: { draft?: boolean } }>(e: T) => withSamples || live(e);

export async function getServices() {
  return (await getCollection('services')).sort((a, b) => a.data.order - b.data.order);
}

export async function getAudiences() {
  return (await getCollection('audiences')).sort((a, b) => a.data.order - b.data.order);
}

export async function getInsights(withSamples = false) {
  // Newest first; on the same date, featured articles lead.
  return (await getCollection('insights', pick(withSamples))).sort(
    (a, b) =>
      b.data.published.valueOf() - a.data.published.valueOf() ||
      Number(b.data.featured) - Number(a.data.featured) ||
      a.data.title.localeCompare(b.data.title),
  );
}

export async function getTestimonials(withSamples = false) {
  return getCollection('testimonials', pick(withSamples));
}

export async function getAccreditations(withSamples = false) {
  return (await getCollection('accreditations', pick(withSamples))).sort((a, b) => a.data.order - b.data.order);
}

export async function getTeam() {
  return (await getCollection('team', live)).sort((a, b) => a.data.order - b.data.order);
}

export async function getFaqs(filter: { topic?: CollectionEntry<'faqs'>['data']['topic']; service?: string }) {
  const all = await getCollection('faqs');
  return all
    .filter((f) => (filter.topic ? f.data.topic === filter.topic : true))
    .filter((f) => (filter.service ? f.data.services.includes(filter.service) : true))
    .sort((a, b) => a.data.order - b.data.order);
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });

export async function getSoftware() {
  return (await getCollection('software')).sort((a, b) => a.data.order - b.data.order);
}

/** The four service areas, each with its services resolved and in order. */
export async function getGroups() {
  const [groups, services] = await Promise.all([getCollection('service-groups'), getServices()]);
  return groups
    .sort((a, b) => a.data.order - b.data.order)
    .map((g) => ({
      ...g,
      items: g.data.services
        .map((ref) => services.find((s) => s.id === ref.id))
        .filter((s): s is CollectionEntry<'services'> => Boolean(s)),
    }));
}
export type Group = Awaited<ReturnType<typeof getGroups>>[number];

/** URL of a service page: /services/[group]/[service]/ */
export const serviceHref = (groupId: string, serviceId: string) => `/services/${groupId}/${serviceId}/`;
export const groupHref = (groupId: string) => `/services/${groupId}/`;

/** Approximate reading time from the article body (200 words per minute, minimum 1). */
export const readMinutes = (body = '') => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));

/** Brand tone for a service area by position: deep blue, sky blue, deep green, green. */
export const groupTones = ['blue-deep', 'blue', 'green-deep', 'green'] as const;

/** Every service with the area it belongs to, its URL and its area's tone. */
export async function getServiceIndex() {
  const groups = await getGroups();
  return groups.flatMap((g, gi) =>
    g.items.map((s) => ({ service: s, group: g, href: serviceHref(g.id, s.id), tone: groupTones[gi % 4] })),
  );
}
export type ServiceRef = Awaited<ReturnType<typeof getServiceIndex>>[number];

export async function getLocations() {
  return (await getCollection('locations')).sort((a, b) => a.data.order - b.data.order);
}

/** FAQs tagged for a "Who we help" audience, in order. */
export async function getFaqsForAudience(id: string) {
  const all = await getCollection('faqs');
  return all.filter((f) => f.data.audiences.includes(id)).sort((a, b) => a.data.order - b.data.order);
}

/** FAQs linked to any of the given services, without duplicates, in order. */
export async function getFaqsForServices(ids: string[]) {
  const all = await getCollection('faqs');
  return all.filter((f) => f.data.services.some((s) => ids.includes(s))).sort((a, b) => a.data.order - b.data.order);
}
