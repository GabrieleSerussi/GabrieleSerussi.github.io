import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { PROFILE_LINKS, clean, stripMd } from '../lib/site';
import { primaryLink, venueLine } from '../lib/papers';

// A plain-text summary for AI assistants and crawlers (llmstxt.org format).
export const GET: APIRoute = async ({ site }) => {
  const profile = (await getEntry('profile', 'me'))?.data;
  if (!profile) throw new Error('src/data/profile.yaml must start with a "me:" entry.');
  const base = site?.href ?? 'https://gabrieleserussi.com/';
  const selected = (await getCollection('papers')).filter((p) => p.data.selected);

  const research = selected.map((p) => {
    const href = primaryLink(p.data.links) ?? new URL(`/#paper-${p.id}`, base).href;
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
    ...profile.about.map((paragraph) => stripMd(paragraph, base)),
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
  ].join('\n');

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
