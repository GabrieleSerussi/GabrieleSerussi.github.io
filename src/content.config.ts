import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

// Every piece of content lives in src/data/*.yaml. These schemas reject malformed entries at
// build time; src/lib/validate.ts adds the accuracy checks (TODOs, teasers, author lists).

const papers = defineCollection({
  loader: file('src/data/papers.yaml'),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    venue: z.string(),
    type: z.enum(['conference', 'journal', 'workshop', 'preprint']),
    role: z.enum(['first author', 'co-first author', 'second author', 'middle author', 'last author', 'co-author']),
    theme: z.string().optional(),
    selected: z.boolean().default(false),
    tldr: z.string().optional(),
    also_presented: z.string().optional(),
    year: z.number().int().optional(),
    links: z.record(z.string(), z.string()).default({}),
    bibtex: z.string().optional(),
    // Private notes: never shown on the site, but a TODO here still blocks production builds.
    note: z.string().optional(),
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
    tagline_detail: z.string().optional(),
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
    alumni_of: z.string().optional(),
    about: z.array(z.string()).min(1),
    open_to: z.string().optional(),
    email: z.string().optional(),
    cv: z.string().optional(),
    links: z.record(z.string(), z.string()).default({}),
    knows_about: z.array(z.string()).default([]),
    goatcounter: z.string().default(''),
  }),
});

const strip = defineCollection({
  loader: file('src/data/strip.yaml'),
  schema: z.object({
    paper: z.string(),
    frames: z.number().int().min(4).max(24),
    needed: z.array(z.number().int()).min(1),
    caption: z.string(),
  }),
});

export const collections = { papers, news, profile, strip };
