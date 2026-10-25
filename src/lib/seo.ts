import type { CollectionEntry } from 'astro:content';
import { clean } from './site';
import { paperYear, primaryLink, type Paper } from './papers';

type Profile = CollectionEntry<'profile'>['data'];
type Affiliation = Profile['affiliations'][number];

const MARKS = /[*†‡]+$/;

const organization = (a: Affiliation, type: string) => ({
  '@type': type,
  name: a.org_formal ?? a.org,
  ...(a.org_formal && a.org_formal !== a.org ? { alternateName: a.org } : {}),
  ...(clean(a.url) ? { url: a.url } : {}),
});

/**
 * schema.org graph for the homepage: the person, the page about them, the site and every paper.
 * Search engines use it for the knowledge panel; AI assistants use it to tie the name, the
 * affiliations, the profiles and the papers together.
 */
export function profileGraph(profile: Profile, papers: Paper[], site: URL, image?: string, updated?: Date) {
  const personId = new URL('#person', site).href;
  const universities = profile.affiliations.filter((a) => a.kind === 'university');
  const company = profile.affiliations.find((a) => a.kind === 'company');
  const alumni = [profile.alumni_of ?? []].flat().filter((name) => clean(name));
  const [givenName, ...rest] = profile.name.split(' ');

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: profile.name,
    givenName,
    familyName: rest.join(' '),
    url: site.href,
    description: profile.description,
    ...(image ? { image } : {}),
    ...(company ? { jobTitle: company.role, worksFor: organization(company, 'Organization') } : {}),
    ...(universities.length > 0 ? { affiliation: universities.map((a) => organization(a, 'CollegeOrUniversity')) } : {}),
    ...(alumni.length > 0 ? { alumniOf: alumni.map((name) => ({ '@type': 'CollegeOrUniversity', name })) } : {}),
    ...(profile.knows_about.length > 0 ? { knowsAbout: profile.knows_about } : {}),
    sameAs: Object.values(profile.links).filter((v) => clean(v)),
  };

  const articles = papers.map((p) => {
    const d = p.data;
    const links = Object.values(d.links).filter((v) => clean(v));
    const url = primaryLink(d.links);
    return {
      '@type': 'ScholarlyArticle',
      '@id': new URL(`/publications/#paper-${p.id}`, site).href,
      headline: d.title,
      name: d.title,
      ...(clean(d.short) ? { alternateName: d.short } : {}),
      author: d.authors.map((a) => {
        const name = a.replace(MARKS, '').trim();
        return name === profile.name ? { '@id': personId } : { '@type': 'Person', name };
      }),
      datePublished: String(paperYear(d)),
      ...(clean(d.tldr) ? { abstract: d.tldr } : {}),
      ...(url ? { url } : {}),
      ...(links.length > 0 ? { sameAs: links } : {}),
      publication: { '@type': 'PublicationEvent', name: d.venue },
      ...(d.keywords.length > 0 ? { keywords: d.keywords.join(', ') } : clean(d.theme) ? { keywords: d.theme } : {}),
      inLanguage: 'en',
    };
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': site.href,
        url: site.href,
        name: profile.site_title,
        mainEntity: { '@id': personId },
        ...(updated ? { dateModified: updated.toISOString() } : {}),
      },
      { '@type': 'WebSite', '@id': new URL('#website', site).href, url: site.href, name: profile.name, inLanguage: 'en' },
      person,
      ...articles,
    ],
  };
}
