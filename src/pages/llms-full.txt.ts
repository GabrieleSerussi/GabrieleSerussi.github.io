import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { PROFILE_LINKS, clean, stripMd } from '../lib/site';
import { getPapers, paperLinks, venueLine } from '../lib/papers';
import { profileProse, timelineLines } from '../lib/profileText';

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
      `Venue: ${venueLine(d)}`,
      ...(tldr ? [`Result: ${tldr}`] : []),
      ...(d.keywords.length > 0 ? [`Keywords: ${d.keywords.join(', ')}`] : []),
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
    profile.tagline,
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
    '## Research interests',
    '',
    profile.knows_about.join(', '),
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
