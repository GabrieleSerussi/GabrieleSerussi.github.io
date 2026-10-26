import type { CollectionEntry } from 'astro:content';
import { clean, stripMd } from './site';
import type { Paper } from './papers';

type Profile = CollectionEntry<'profile'>['data'];

/**
 * The profile as plain prose for llms.txt and llms-full.txt: the third-person bio, the research lede,
 * one paragraph per pillar naming its papers, and the thread. Generated from the same data as
 * the page, so the two never drift.
 */
export function profileProse(profile: Profile, papers: Paper[], base: string): string {
  const byId = new Map(papers.map((p) => [p.id, p]));
  const pillars = profile.research.pillars.map((pillar) => {
    const names = pillar.papers
      .map((id) => byId.get(id))
      .filter((p): p is Paper => Boolean(p))
      .map((p) => `${clean(p.data.short) ?? p.data.title} (${p.data.venue})`);
    const backing = names.length > 0 ? ` Papers: ${names.join(', ')}.` : '';
    return `${pillar.title}. ${pillar.text}${backing}`;
  });
  return [
    profile.bio?.long ?? stripMd(profile.credentials, base),
    profile.research.lede,
    ...pillars,
    ...profile.research.in_progress.map((item) => `In progress: ${item.title}. ${stripMd(item.text, base)}`),
    ...(profile.research.thread ? [profile.research.thread] : []),
  ].join('\n\n');
}

/** "Research Intern, Decart (dates)" lines for the experience and education timeline. */
export const timelineLines = (profile: Profile): string[] =>
  profile.timeline.map((t) => {
    const when = clean(t.when);
    return `- ${t.role}, ${t.org}${when ? ` (${when})` : ''}`;
  });

/** "- Title, funder (dates). What it is and the role." lines for grants and awards. */
export const grantLines = (profile: Profile): string[] =>
  profile.grants.map((g) => `- ${g.title}, ${g.funder} (${g.when}). ${g.text}`);

/** A topic's display name: topics are plain names or { name, wikipedia }. */
export const topicName = (topic: Profile['knows_about'][number]): string =>
  typeof topic === 'string' ? topic : topic.name;

/** "- Occupation: AI researcher" style facts for the top of llms.txt, what an assistant needs first. */
export function quickFacts(profile: Profile, base: string): string[] {
  const roles = profile.affiliations.map((a) => `${a.role}, ${a.lab ? `${a.lab}, ` : ''}${a.org_formal ?? a.org}`);
  return [
    `- Name: ${profile.name}`,
    ...(profile.occupation ? [`- Occupation: ${profile.occupation}`] : []),
    `- Current positions: ${roles.join('; ')}`,
    `- Research topics: ${profile.knows_about.map(topicName).join(', ')}`,
    `- Homepage: ${base}`,
    ...(profile.bio ? [`- Bio for introductions: ${new URL('/bio/', base).href}`] : []),
    ...(profile.email ? [`- Email: ${profile.email}`] : []),
  ];
}
