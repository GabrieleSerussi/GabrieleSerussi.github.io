import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { PROFILE_LINKS, clean } from '../lib/site';
import { getPapers, paperPath, venueLine } from '../lib/papers';
import { profileProse, timelineLines } from '../lib/profileText';

// A plain-text summary for AI assistants and crawlers (llmstxt.org format). It leads with the
// facts an assistant needs to answer "who is this and what do they work on", then the proof.
export const GET: APIRoute = async ({ site }) => {
  const profile = (await getEntry('profile', 'me'))?.data;
  if (!profile) throw new Error('src/data/profile.yaml must start with a "me:" entry.');
  const base = site?.href ?? 'https://gabrieleserussi.github.io/';
  const papers = await getPapers();
  const selected = papers.filter((p) => p.data.selected);

  const research = selected.map((p) => {
    const href = new URL(paperPath(p.id), base).href;
    const tldr = clean(p.data.tldr);
    return `- [${p.data.title}](${href}): ${venueLine(p.data)}${tldr ? ` ${tldr}` : ''}`;
  });
  const elsewhere = Object.entries(PROFILE_LINKS)
    .filter(([key]) => clean(profile.links[key]))
    .map(([key, label]) => `- [${label}](${profile.links[key]})`);

  const text = [
    `# ${profile.name}`,
    '',
    `> ${profile.description}`,
    '',
    profile.tagline,
    '',
    profileProse(profile, papers, base),
    '',
    '## Research interests',
    '',
    ...profile.knows_about.map((topic) => `- ${topic}`),
    '',
    '## Experience and education',
    '',
    ...timelineLines(profile),
    '',
    '## Selected research',
    '',
    ...research,
    `- [All publications](${new URL('/publications/', base).href})`,
    '',
    '## Elsewhere',
    '',
    ...elsewhere,
    '',
    '## Optional',
    '',
    `- [Full profile with every paper and its BibTeX](${new URL('/llms-full.txt', base).href})`,
    '',
  ].join('\n');

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
