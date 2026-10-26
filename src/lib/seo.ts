import type { CollectionEntry } from 'astro:content';
import { clean } from './site';
import { paperPath, paperYear, plainAuthor, type Paper } from './papers';

type Profile = CollectionEntry<'profile'>['data'];
type Affiliation = Profile['affiliations'][number];

const topic = (t: Profile['knows_about'][number]) =>
  typeof t === 'string' ? t : { '@type': 'Thing', name: t.name, sameAs: t.wikipedia };

const organization = (a: Affiliation, type: string) => ({
  '@type': type,
  name: a.org_formal ?? a.org,
  ...(a.org_formal && a.org_formal !== a.org ? { alternateName: a.org } : {}),
  ...(clean(a.url) ? { url: a.url } : {}),
});

/**
 * The person, with everything an assistant needs to answer "who works on X": the roles, the
 * research group, the topics (tied to Wikipedia), the ORCID iD and the profiles.
 * Shared by the homepage and /bio/, so both describe the same entity (#person).
 */
export function personNode(profile: Profile, site: URL, image?: string) {
  const personId = new URL('#person', site).href;
  const universities = profile.affiliations.filter((a) => a.kind === 'university');
  const company = profile.affiliations.find((a) => a.kind === 'company');
  const labs = universities.filter((a) => clean(a.lab));
  const alumni = [profile.alumni_of ?? []].flat().filter((name) => clean(name));
  const orcid = clean(profile.links.orcid)?.match(/orcid\.org\/([\dX-]+)/)?.[1];
  const [givenName, ...rest] = profile.name.split(' ');

  return {
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
    ...(labs.length > 0
      ? {
          memberOf: labs.map((a) => ({
            '@type': 'ResearchOrganization',
            name: a.lab,
            ...(clean(a.url) ? { url: a.url } : {}),
            parentOrganization: { '@type': 'CollegeOrUniversity', name: a.org_formal ?? a.org },
          })),
        }
      : {}),
    ...(profile.occupation ? { hasOccupation: { '@type': 'Occupation', name: profile.occupation } } : {}),
    ...(alumni.length > 0 ? { alumniOf: alumni.map((name) => ({ '@type': 'CollegeOrUniversity', name })) } : {}),
    ...(profile.knows_about.length > 0 ? { knowsAbout: profile.knows_about.map(topic) } : {}),
    ...(profile.grants.length > 0 ? { award: profile.grants.map((g) => `${g.title}, ${g.funder} research grant (${g.when})`) } : {}),
    ...(orcid ? { identifier: { '@type': 'PropertyValue', propertyID: 'ORCID', value: orcid } } : {}),
    sameAs: Object.values(profile.links).filter((v) => clean(v)),
  };
}

/**
 * schema.org graph for the homepage: the person, the page about them, the site and every paper.
 * Search engines use it for the knowledge panel; AI assistants use it to tie the name, the
 * affiliations, the profiles and the papers together.
 */
export function profileGraph(profile: Profile, papers: Paper[], site: URL, image?: string, updated?: Date) {
  const personId = new URL('#person', site).href;
  const person = personNode(profile, site, image);

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

/** schema.org graph for /bio/: an AboutPage whose main entity is the same person as the homepage. */
export function bioGraph(profile: Profile, site: URL, image?: string) {
  const page = new URL('/bio/', site).href;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': page,
        url: page,
        name: `Bio of ${profile.name}`,
        isPartOf: { '@id': new URL('#website', site).href },
        mainEntity: { '@id': new URL('#person', site).href },
        ...(profile.bio ? { description: profile.bio.short } : {}),
      },
      { '@type': 'WebSite', '@id': new URL('#website', site).href, url: site.href, name: profile.name, inLanguage: 'en' },
      personNode(profile, site, image),
    ],
  };
}
