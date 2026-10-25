import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** "staging" (default): noindex, TODOs allowed and listed on the page. "production": strict. */
export const STAGE: 'staging' | 'production' =
  process.env.SITE_STAGE === 'production' ? 'production' : 'staging';
export const IS_PRODUCTION = STAGE === 'production';

const TODO = /\bTODO\b/;

export const isTodo = (value: unknown): boolean => typeof value === 'string' && TODO.test(value);

/** Returns the value unless it is empty or still a TODO. */
export const clean = (value: string | null | undefined): string | undefined =>
  value && !isTodo(value) ? value : undefined;

/** Lists the dotted path of every string that still contains TODO. */
export function findTodos(value: unknown, path: string[] = []): string[] {
  if (typeof value === 'string') return TODO.test(value) ? [path.join('.') || 'value'] : [];
  if (Array.isArray(value)) return value.flatMap((item, i) => findTodos(item, [...path, String(i)]));
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.entries(value).flatMap(([key, item]) => findTodos(item, [...path, key]));
  }
  return [];
}

export const hasPublicFile = (relativePath: string): boolean =>
  existsSync(join(process.cwd(), 'public', relativePath.replace(/^\//, '')));

/** Date of the last commit, so "Last updated" reflects real edits rather than weekly rebuilds. */
export function lastUpdated(): Date {
  try {
    const iso = execSync('git log -1 --format=%cI', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    if (iso) return new Date(iso);
  } catch {
    // Not a git checkout yet: fall back to the build date.
  }
  return new Date();
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, (c) => ESCAPES[c]);

const MD_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** True when the text contains at least one [label](url) link. */
export const hasMdLink = (text: string): boolean => new RegExp(MD_LINK.source).test(text);

/** Escapes text and turns [label](url) into links. Nothing else is interpreted. */
export const inlineMd = (text: string): string =>
  escapeHtml(text).replace(MD_LINK, (_match, label: string, href: string) => `<a href="${href}">${label}</a>`);

/** Plain-text version of inlineMd, used for llms.txt: "label (absolute url)". */
export const stripMd = (text: string, base: string): string =>
  text.replace(MD_LINK, (_match, label: string, href: string) => `${label} (${new URL(href, base).href})`);

/** "@GSerussi" from an x.com or twitter.com profile URL. */
export const xHandle = (url: string | undefined): string | undefined => {
  const handle = clean(url)?.match(/(?:x|twitter)\.com\/([A-Za-z0-9_]+)/)?.[1];
  return handle ? `@${handle}` : undefined;
};

/** Display names for profile links, in the order the footer shows them. */
export const PROFILE_LINKS: Record<string, string> = {
  scholar: 'Google Scholar',
  github: 'GitHub',
  x: 'X',
  linkedin: 'LinkedIn',
  orcid: 'ORCID',
  openreview: 'OpenReview',
  dblp: 'DBLP',
  semantic_scholar: 'Semantic Scholar',
  huggingface: 'Hugging Face',
  alphaxiv: 'alphaXiv',
};

/**
 * Event name for GoatCounter click tracking, e.g. track('paper', 'herbench', 'arXiv') gives
 * "paper-herbench-arxiv". count.js counts clicks on any element with data-goatcounter-click.
 */
export const track = (...parts: string[]): string =>
  parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
