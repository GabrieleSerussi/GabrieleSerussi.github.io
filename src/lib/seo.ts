import type { CollectionEntry } from 'astro:content';
import { clean } from './site';
import { paperPath, paperYear, plainAuthor, type Paper } from './papers';

type Profile = CollectionEntry<'profile'>['data'];
type Affiliation = Profile['affiliations'][number];

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
    ...(profile.grants.length > 0 ? { award: profile.grants.map((g) => `${g.title}, ${g.funder} research grant (${g.when})`) } : {}),
    sameAs: Object.values(profile.links).filter((v) => clean(v)),
  };

  const articles = papers.map((p) => articleNode(p, profile, site));

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

/** The paper as a schema.org ScholarlyArticle, identified by its page on this site. */
export function articleNode(p: Paper, profile: Profile, site: URL, image?: string) {
  const d = p.data;
  const page = new URL(paperPath(p.id), site).href;
  const personId = new URL('#person', site).href;
  const links = Object.values(d.links).filter((v) => clean(v));
  return {
    '@type': 'ScholarlyArticle',
    '@id': `${page}#article`,
    url: page,
    mainEntityOfPage: page,
    headline: d.title,
    name: d.title,
    ...(clean(d.short) ? { alternateName: d.short } : {}),
    author: d.authors.map((a) => {
      const name = plainAuthor(a);
      return name === profile.name ? { '@id': personId, '@type': 'Person', name } : { '@type': 'Person', name };
    }),
    datePublished: String(paperYear(d)),
    ...(clean(d.abstract) ? { abstract: d.abstract } : clean(d.tldr) ? { abstract: d.tldr } : {}),
    ...(clean(d.tldr) ? { description: d.tldr } : {}),
    ...(image ? { image } : {}),
    ...(links.length > 0 ? { sameAs: links } : {}),
    publication: { '@type': 'PublicationEvent', name: clean(d.venue_full) ?? d.venue },
    ...(d.keywords.length > 0 ? { keywords: d.keywords.join(', ') } : clean(d.theme) ? { keywords: d.theme } : {}),
    inLanguage: 'en',
  };
}

/** schema.org graph for a paper page: the page, its breadcrumb trail and the article. */
export function paperGraph(p: Paper, profile: Profile, site: URL, image?: string) {
  const page = new URL(paperPath(p.id), site).href;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': page,
        url: page,
        name: p.data.title,
        isPartOf: { '@id': new URL('#website', site).href },
        mainEntity: { '@id': `${page}#article` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: profile.name, item: site.href },
            { '@type': 'ListItem', position: 2, name: 'Publications', item: new URL('/publications/', site).href },
            { '@type': 'ListItem', position: 3, name: clean(p.data.short) ?? p.data.title, item: page },
          ],
        },
      },
      { '@type': 'WebSite', '@id': new URL('#website', site).href, url: site.href, name: profile.name, inLanguage: 'en' },
      articleNode(p, profile, site, image),
    ],
  };
}
