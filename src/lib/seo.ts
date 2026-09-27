import type { CollectionEntry } from 'astro:content';
import { clean } from './site';

type Profile = CollectionEntry<'profile'>['data'];
type Affiliation = Profile['affiliations'][number];

const organization = (a: Affiliation, type: string) => ({
  '@type': type,
  name: a.org_formal ?? a.org,
  ...(clean(a.url) ? { url: a.url } : {}),
});

/** schema.org Person, so search engines and AI assistants can tie your profiles together. */
export function personJsonLd(profile: Profile, site: URL, image?: string): Record<string, unknown> {
  const universities = profile.affiliations.filter((a) => a.kind === 'university');
  const company = profile.affiliations.find((a) => a.kind === 'company');
  const alumni = clean(profile.alumni_of);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: site.href,
    description: profile.description,
    ...(image ? { image } : {}),
    ...(company ? { jobTitle: company.role, worksFor: organization(company, 'Organization') } : {}),
    ...(universities.length > 0 ? { affiliation: universities.map((a) => organization(a, 'CollegeOrUniversity')) } : {}),
    ...(alumni ? { alumniOf: { '@type': 'CollegeOrUniversity', name: alumni } } : {}),
    ...(profile.knows_about.length > 0 ? { knowsAbout: profile.knows_about } : {}),
    sameAs: Object.values(profile.links).filter((v) => clean(v)),
  };
}
