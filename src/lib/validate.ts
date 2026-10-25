import type { CollectionEntry } from 'astro:content';
import { IS_PRODUCTION, findTodos, hasPublicFile } from './site';
import { findLogo, findMark, findTeaser, headshot } from './media';
import { isAuthor } from './papers';

export type Issue = { where: string; message: string };

type Input = {
  profile: CollectionEntry<'profile'>['data'];
  papers: CollectionEntry<'papers'>[];
  news: CollectionEntry<'news'>[];
};

/** Everything that must be true before launch. Staging lists these; production refuses to build. */
export function collectIssues({ profile, papers, news }: Input): Issue[] {
  const issues: Issue[] = [];
  const add = (where: string, message: string): void => {
    issues.push({ where, message });
  };
  const todos = (where: string, value: unknown): void => {
    for (const path of findTodos(value)) {
      add(where, path === 'teaser' ? 'delete the teaser line; teasers are found by file name' : `${path} still says TODO`);
    }
  };

  todos('profile.yaml', profile);
  if (!headshot()) add('src/assets', 'add your headshot as headshot.jpg, a square photo');
  if (profile.cv && !hasPublicFile(profile.cv)) add('public', `add your CV at public${profile.cv}`);
  for (const logo of profile.logos) {
    if (!findLogo(logo.file).light) add('src/assets/logos', `add ${logo.file}.png for ${logo.label}`);
  }
  for (const t of profile.timeline) {
    if (t.logo && !findMark(t.logo)) add('src/assets/logos', `add ${t.logo}-mark.png for ${t.org}`);
  }
  const ids = new Set(papers.map((p) => p.id));
  for (const pillar of profile.research.pillars) {
    for (const id of pillar.papers) {
      if (!ids.has(id)) add('profile.yaml', `research pillar "${pillar.title}" lists "${id}", which isn't in papers.yaml`);
    }
  }

  for (const paper of papers) {
    const where = `papers.yaml, ${paper.id}`;
    const d = paper.data;
    todos(where, d);
    if (findTodos(d.authors).length === 0 && !isAuthor(d.authors, profile.name)) {
      add(where, `the author list doesn't include ${profile.name}`);
    }
    if (d.selected) {
      if (!d.tldr) add(where, 'selected papers need a one-sentence tldr');
      if (d.emphasis === 'lead' && !d.hook) add(where, 'lead papers need a one-line hook for their highlight card');
      if (d.emphasis !== 'brief' && findTeaser(paper.id).kind === 'none') {
        add(where, `lead and standard papers need a teaser in public/media/${paper.id}/ or src/assets/teasers/${paper.id}.png`);
      }
    }
  }

  for (const item of news) todos(`news.yaml, ${item.id}`, item.data);

  return issues;
}

export function enforce(issues: Issue[]): void {
  if (!IS_PRODUCTION || issues.length === 0) return;
  const list = issues.map((i) => `  - ${i.where}: ${i.message}`).join('\n');
  throw new Error(`The production build stopped because ${issues.length} item(s) need attention:\n${list}`);
}
