import type { CollectionEntry } from 'astro:content';
import { clean, escapeHtml } from './site';

export type Paper = CollectionEntry<'papers'>;
export type PaperData = Paper['data'];

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

/** "CVPR 2026, co-first author." plus any extra venue. */
export function venueLine(d: PaperData): string {
  const main = [d.venue, OWNERSHIP[d.role]].filter(Boolean).join(', ');
  const also = clean(d.also_presented);
  return also ? `${main}. Also presented at ${also}.` : `${main}.`;
}

export function paperYear(d: PaperData): number {
  if (d.year) return d.year;
  const match = d.venue.match(/\b(?:19|20)\d{2}\b/);
  return match ? Number(match[0]) : 0;
}
