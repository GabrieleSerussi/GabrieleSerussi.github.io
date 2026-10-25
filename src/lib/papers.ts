import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { clean, escapeHtml } from './site';

export type Paper = CollectionEntry<'papers'>;
export type PaperData = Paper['data'];

// Astro's data store keeps entries sorted by id, so the order of papers.yaml is read back
// from the file itself. Every entry starts with "- id: <id>".
const ENTRY_ID = /^-\s+id:\s*["']?([^"'\s#]+)/gm;

/** Every paper, in the order it appears in papers.yaml. */
export async function getPapers(): Promise<Paper[]> {
  const text = readFileSync(join(process.cwd(), 'src/data/papers.yaml'), 'utf8');
  const order = new Map([...text.matchAll(ENTRY_ID)].map((match, i) => [match[1], i]));
  const rank = (p: Paper): number => order.get(p.id) ?? order.size;
  return (await getCollection('papers')).sort((a, b) => rank(a) - rank(b));
}

const LINK_LABELS: Record<string, string> = {
  paper: 'Paper',
  arxiv: 'arXiv',
  openreview: 'OpenReview',
  project: 'Project',
  code: 'Code',
  dataset: 'Dataset',
  video: 'Video',
  slides: 'Slides',
  poster: 'Poster',
  blog: 'Blog post',
};
const LINK_ORDER = Object.keys(LINK_LABELS);

const MARKS = /[*†‡]+$/;
const bareName = (author: string): string => author.replace(MARKS, '').trim();

export const isAuthor = (authors: string[], me: string): boolean => authors.some((a) => bareName(a) === me);

export const hasEqualContribution = (papers: Paper[]): boolean =>
  papers.some((p) => p.data.authors.some((a) => a.trim().endsWith('*')));

/** Author list as HTML with your own name in bold. */
export const formatAuthors = (authors: string[], me: string): string =>
  authors.map((a) => (bareName(a) === me ? `<strong>${escapeHtml(a)}</strong>` : escapeHtml(a))).join(', ');

/** Links in a fixed order, skipping anything empty or still TODO. */
export function paperLinks(links: Record<string, string>): { label: string; href: string }[] {
  const rank = (key: string): number => {
    const i = LINK_ORDER.indexOf(key);
    return i === -1 ? LINK_ORDER.length : i;
  };
  return Object.entries(links)
    .filter(([, href]) => clean(href))
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([key, href]) => ({ label: LINK_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1), href }));
}

/** Where the paper title points: the project page if there is one, then the paper. */
export function primaryLink(links: Record<string, string>): string | undefined {
  for (const key of ['project', 'paper', 'arxiv', 'openreview']) {
    const href = clean(links[key]);
    if (href) return href;
  }
  return undefined;
}

// Only ownership roles are worth printing next to the venue.
const OWNERSHIP: Record<string, string> = { 'first author': 'first author', 'co-first author': 'co-first author' };

export const ownership = (d: PaperData): string | undefined => OWNERSHIP[d.role];

/** "IROS 2024, oral pitch, co-first author." plus any extra venue. Used for plain text. */
export function venueLine(d: PaperData): string {
  const presentation = clean(d.presentation)?.toLowerCase();
  const main = [d.venue, presentation, ownership(d)].filter(Boolean).join(', ');
  const also = clean(d.also_presented);
  return also ? `${main}. Also presented at ${also}.` : `${main}.`;
}

export type Badge = { label: string; tone: 'solid' | 'accent' | 'quiet' };

/** Badges for a paper: the venue, how it was presented, the role and one impact figure. */
export function badges(d: PaperData): Badge[] {
  const role = ownership(d);
  const list: Badge[] = [{ label: d.venue, tone: 'solid' }];
  if (clean(d.presentation)) list.push({ label: d.presentation as string, tone: 'accent' });
  if (role) list.push({ label: role.charAt(0).toUpperCase() + role.slice(1), tone: 'quiet' });
  if (clean(d.proof)) list.push({ label: d.proof as string, tone: 'quiet' });
  return list;
}

/** "CVPR '26", "ICML '26 workshop", "IROS '24, oral pitch": the venue on a research chip. */
export function shortVenue(d: PaperData): string {
  const year = d.venue.match(/\b(?:19|20)(\d{2})\b/)?.[1];
  const name = d.venue.split(/\s+(?:19|20)\d{2}\b/)[0].trim();
  const base = year ? `${name} '${year}` : d.venue;
  const workshop = d.type === 'workshop' ? ' workshop' : '';
  const presentation = clean(d.presentation) ? `, ${(d.presentation as string).toLowerCase()}` : '';
  return `${base}${workshop}${presentation}`;
}

export function paperYear(d: PaperData): number {
  if (d.year) return d.year;
  const match = d.venue.match(/\b(?:19|20)\d{2}\b/);
  return match ? Number(match[0]) : 0;
}
