import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

// Every piece of content lives in src/data/*.yaml. These schemas reject malformed entries at
// build time; src/lib/validate.ts adds the accuracy checks (TODOs, teasers, author lists).

const papers = defineCollection({
  loader: file('src/data/papers.yaml'),
  schema: z.object({
    title: z.string(),
    // Short name for highlight cards, research chips and structured data, e.g. "HERBench".
    short: z.string().optional(),
    authors: z.array(z.string()).min(1),
    venue: z.string(),
    // How the venue presented the work, e.g. "Oral pitch". Only once it is public.
    presentation: z.string().optional(),
    type: z.enum(['conference', 'journal', 'workshop', 'preprint']),
    role: z.enum(['first author', 'co-first author', 'second author', 'middle author', 'last author', 'co-author']),
    theme: z.string().optional(),
    selected: z.boolean().default(false),
    // How much room a selected paper gets: lead papers are highlight cards and full rows,
    // standard papers are full rows with a teaser, brief papers are one row without either.
    emphasis: z.enum(['lead', 'standard', 'brief']).default('standard'),
    // One line for the highlight card: what most makes a reader want to read more.
    hook: z.string().optional(),
    // Task, method and dataset terms for search engines and AI assistants (structured data).
    keywords: z.array(z.string()).default([]),
    // One impact badge, e.g. "11k+ dataset downloads". Keep the source and date in a comment.
    proof: z.string().optional(),
    tldr: z.string().optional(),
    // The published abstract, shown on the paper's own page (/research/<id>/).
    abstract: z.string().optional(),
    abstract_source: z.enum(['CVF', 'OpenReview', 'arXiv', 'IEEE']).optional(),
    // Full venue name and page range, for the Google Scholar citation tags.
    venue_full: z.string().optional(),
    pages: z.string().optional(),
    also_presented: z.string().optional(),
    year: z.number().int().optional(),
    links: z.record(z.string(), z.string()).default({}),
    bibtex: z.string().optional(),
    // Private notes: never shown on the site, but a TODO here still blocks production builds.
    note: z.string().optional(),
    // What the teaser shows, for screen readers. Falls back to a generic description.
    teaser_alt: z.string().optional(),
    // No longer used: teasers are found by file name. Kept so older files still parse.
    teaser: z.string().optional(),
  }),
});

const news = defineCollection({
  loader: file('src/data/news.yaml'),
  schema: z.object({
    date: z.coerce.date(),
    text: z.string(),
  }),
});

const profile = defineCollection({
  loader: file('src/data/profile.yaml'),
  schema: z.object({
    name: z.string(),
    site_title: z.string(),
    tagline: z.string(),
    credentials: z.string(),
    description: z.string().max(170),
    affiliations: z
      .array(
        z.object({
          role: z.string(),
          org: z.string(),
          org_formal: z.string().optional(),
          url: z.string().optional(),
          kind: z.enum(['university', 'company']),
        }),
      )
      .min(1),
    logos: z.array(z.object({ file: z.string(), label: z.string(), url: z.string() })).default([]),
    alumni_of: z.union([z.string(), z.array(z.string())]).optional(),
    advisor: z.string().optional(),
    research: z.object({
      lede: z.string(),
      pillars: z
        .array(
          z.object({
            kicker: z.string(),
            title: z.string(),
            text: z.string(),
            papers: z.array(z.string()).default([]),
          }),
        )
        .min(1),
      thread: z.string().optional(),
      // Unpublished projects as open questions: no results, methods, venues or names. Replace each
      // with its paper once it is public.
      in_progress: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    }),
    timeline: z
      .array(
        z.object({
          org: z.string(),
          role: z.string(),
          when: z.string(),
          url: z.string().optional(),
          logo: z.string().optional(),
        }),
      )
      .default([]),
    // Grants and awards under the timeline, newest first. "funder" also goes to structured data.
    grants: z
      .array(
        z.object({
          title: z.string(),
          funder: z.string(),
          when: z.string(),
          text: z.string(),
        }),
      )
      .default([]),
    open_to: z.string().optional(),
    email: z.string().optional(),
    cv: z.string().optional(),
    links: z.record(z.string(), z.string()).default({}),
    knows_about: z.array(z.string()).default([]),
    site_verification: z.object({ google: z.string().optional(), bing: z.string().optional() }).default({}),
    goatcounter: z.string().default(''),
  }),
});

export const collections = { papers, news, profile };
