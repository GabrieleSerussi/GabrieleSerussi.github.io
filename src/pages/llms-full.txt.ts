import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { PROFILE_LINKS, clean, stripMd } from '../lib/site';
import { getPapers, paperLinks, paperPath, venueLine } from '../lib/papers';
import { grantLines, profileProse, quickFacts, timelineLines, topicName } from '../lib/profileText';

// Everything on the site as one plain-text file for AI assistants: the profile, every paper
// with its authors, venue, result, links and BibTeX, and the recent news.
export const GET: APIRoute = async ({ site }) => {
  const profile = (await getEntry('profile', 'me'))?.data;
  if (!profile) throw new Error('src/data/profile.yaml must start with a "me:" entry.');
  const base = site?.href ?? 'https://gabrieleserussi.github.io/';
  const papers = await getPapers();
  const news = (await getCollection('news'))
    .map((n) => n.data)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const paperBlocks = papers.map((p) => {
    const d = p.data;
    const links = paperLinks(d.links).map((l) => `- ${l.label}: ${l.href}`);
    const tldr = clean(d.tldr);
    const bibtex = clean(d.bibtex);
    return [
      `### ${d.title}`,
      '',
      `Authors: ${d.authors.join(', ')}`,
      `Page: ${new URL(paperPath(p.id), base).href}`,
      `Venue: ${venueLine(d)}`,
      ...(tldr ? [`Result: ${tldr}`] : []),
      ...(d.keywords.length > 0 ? [`Keywords: ${d.keywords.join(', ')}`] : []),
      ...(clean(d.abstract) ? ['', `Abstract: ${d.abstract}`] : []),
      '',
      ...links,
      ...(bibtex ? ['', '```bibtex', bibtex, '```'] : []),
      '',
    ].join('\n');
  });
  const elsewhere = Object.entries(PROFILE_LINKS)
    .filter(([key]) => clean(profile.links[key]))
    .map(([key, label]) => `- ${label}: ${profile.links[key]}`);

  const text = [
    `# ${profile.name}`,
    '',
    `> ${profile.description}`,
    '',
    ...quickFacts(profile, base),
    '',
    `Mission, in ${profile.name.split(' ')[0]}'s words: "${profile.tagline}"`,
    '',
    '## About',
    '',
    profileProse(profile, papers, base),
    '',
    ...(profile.open_to ? [profile.open_to, ''] : []),
    '## Experience and education',
    '',
    ...timelineLines(profile),
    '',
    ...(profile.grants.length > 0 ? ['## Grants and awards', '', ...grantLines(profile), ''] : []),
    '## Research interests',
    '',
    profile.knows_about.map(topicName).join(', '),
    '',
    '## Publications',
    '',
    '"*" marks equal contribution.',
    '',
    ...paperBlocks,
    '## News',
    '',
    ...news.map((n) => `- ${n.date.toISOString().slice(0, 10)}: ${stripMd(n.text, base)}`),
    '',
    '## Profiles',
    '',
    ...elsewhere,
    '',
  ].join('\n');

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
