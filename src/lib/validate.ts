import type { CollectionEntry } from 'astro:content';
import { IS_PRODUCTION, findTodos, hasPublicFile } from './site';
import { findTeaser, headshot, stripFrames } from './media';
import { isAuthor } from './papers';

export type Issue = { where: string; message: string };

type Input = {
  profile: CollectionEntry<'profile'>['data'];
  papers: CollectionEntry<'papers'>[];
  news: CollectionEntry<'news'>[];
  strip?: CollectionEntry<'strip'>['data'];
};

/** Everything that must be true before launch. Staging lists these; production refuses to build. */
export function collectIssues({ profile, papers, news, strip }: Input): Issue[] {
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
  if (!headshot()) add('src/assets', 'add your headshot as headshot.jpg');
  if (profile.cv && !hasPublicFile(profile.cv)) add('public', `add your CV at public${profile.cv}`);

  for (const paper of papers) {
    const where = `papers.yaml, ${paper.id}`;
    const d = paper.data;
    todos(where, d);
    if (findTodos(d.authors).length === 0 && !isAuthor(d.authors, profile.name)) {
      add(where, `the author list doesn't include ${profile.name}`);
    }
    if (d.selected) {
      if (!d.tldr) add(where, 'selected papers need a one-sentence tldr');
      if (findTeaser(paper.id).kind === 'none') {
        add(where, `selected papers need a teaser in public/media/${paper.id}/ or src/assets/teasers/${paper.id}.png`);
      }
    }
  }

  for (const item of news) todos(`news.yaml, ${item.id}`, item.data);

  if (strip) {
    todos('strip.yaml', strip);
    if (!papers.some((p) => p.id === strip.paper)) add('strip.yaml', `paper "${strip.paper}" isn't in papers.yaml`);
    const outside = strip.needed.filter((n) => n < 1 || n > strip.frames);
    if (outside.length > 0) add('strip.yaml', `needed frames ${outside.join(', ')} are outside 1 to ${strip.frames}`);
    const found = stripFrames().length;
    if (found === 0) add('src/assets/strip', `add ${strip.frames} frame images named 01.jpg, 02.jpg, and so on`);
    else if (found !== strip.frames) add('src/assets/strip', `found ${found} frame images but strip.yaml says ${strip.frames}`);
  }

  return issues;
}

export function enforce(issues: Issue[]): void {
  if (!IS_PRODUCTION || issues.length === 0) return;
  const list = issues.map((i) => `  - ${i.where}: ${i.message}`).join('\n');
  throw new Error(`The production build stopped because ${issues.length} item(s) need attention:\n${list}`);
}
