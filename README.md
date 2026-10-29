# gabrieleserussi.github.io

Source for Gabriele Serussi's research website. It's a static [Astro](https://astro.build) site,
built by GitHub Actions and served by GitHub Pages. All content lives in `src/data/*.yaml`.

## Setup (once)

Requires Node 22.12 or newer (`node -v`).

```bash
npm install astro@7 @astrojs/sitemap @fontsource-variable/mona-sans
npm run dev          # http://localhost:4321
```

The first command also writes `package-lock.json`. Commit it: the deploy action uses it to pick npm.

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Live preview while you edit |
| `npm run build` | Staging build into `dist/` (noindex, TODOs listed on the page) |
| `npm run release` | Production build: fails if anything still needs attention |
| `npm run preview` | Serve the last build locally |
| `npm run check:media` | Fails if any media file is over 2 MB |

## Where content lives

| File | What it controls |
|---|---|
| `src/data/profile.yaml` | Name, mission line, intro (the bio under it), affiliations, research pillars, experience and education, links, email |
| `src/data/papers.yaml` | Every paper; `selected: true` puts it on the homepage, in file order. `emphasis: lead` papers are also highlight cards (they need a `hook` and a teaser), `standard` papers are full rows with a teaser, `brief` papers are one row. `keywords` feed search engines and AI assistants. `proof` adds an impact badge |
| `src/data/news.yaml` | Dated news; items older than 180 days disappear on their own |

Text fields accept `[label](url)` links, and `/research/<id>/` links to a paper's own page.
Anything containing the word `TODO` shows up in the staging panel and blocks production builds.
The `note` field on a paper is never shown on the site, but the repo is public, so keep it factual.

## Media

| What | Where | Notes |
|---|---|---|
| Headshot | `src/assets/headshot.jpg` | Square photo, shown in a circle; optimized at build |
| Logos | `src/assets/logos/` | `<name>.png` in colour, `<name>-dark.png` in white for dark mode, `<name>-mark.png` square for the timeline |
| Teaser video | `public/media/<paper-id>/` | Made by the script below |
| Teaser still | `src/assets/teasers/<paper-id>.png` | 16:9; used when there is no video |
| Teaser description | `teaser_alt` in papers.yaml | What the teaser shows, read out by screen readers |
| CV | `public/cv.pdf` | Linked from the homepage once `cv: /cv.pdf` is set in profile.yaml |
| Link preview | `public/og.png` | 1200x630, shown when the site is shared; update it when the mission line, photo or highlights change |

Make a teaser from any clip (needs ffmpeg):

```bash
scripts/encode-teaser.sh path/to/clip.mp4 herbench 3 5 960   # start at 3 s, keep 5 s, 960 px wide
```

It writes an H.264 MP4 (640px wide unless you pass a width), a smaller WebM (AV1 when
available, otherwise VP9) and a poster frame. Long videos belong on YouTube or Hugging Face,
not in this repo: git keeps every version forever.

## Search engines and AI assistants

Each paper has its own page at `/research/<id>/`, generated from papers.yaml, with the published
abstract, BibTeX and Google Scholar citation tags. Adding a paper with an `abstract` creates its
page automatically.

The homepage carries a schema.org graph (the person, the page, the site and every paper),
`rel="me"` links to every profile, and a link preview image. `/llms.txt` is a short summary
for AI assistants and `/llms-full.txt` has every paper with its result, links and BibTeX.
All of them are generated from `src/data`, so they never drift from the site.

## Staging and production

`SITE_STAGE` decides the build mode.

- **Staging** (default): pages carry `noindex`, analytics stay off, and a panel at the top of the
  homepage lists everything left to fix.
- **Production**: the build stops with a list of problems if any remain.

To launch, set the repository variable `SITE_STAGE` to `production` (Settings, Secrets and
variables, Actions, Variables), then rerun the Deploy workflow.

## Deploying

Every push to `main` builds and deploys. A weekly rebuild keeps the news list current. GitHub
disables scheduled workflows after 60 days without a commit; if that email arrives, the site
probably needs an update anyway.

One-time setup: Settings, Pages, Source: **GitHub Actions**.

The site stays at https://gabrieleserussi.github.io, which keeps it completely free: no custom
domain and no `public/CNAME`. Launching only means setting `SITE_STAGE` to `production`.

## Troubleshooting

- **Papers appear in the wrong order**: Astro sorts collections by id, so the site reads the
  order back from papers.yaml. Every entry has to start with `- id: <id>`.
- **A schema error naming a field**: that entry in the YAML file has a typo or the wrong type.
  The message names the file and the field.

## Analytics (private to you)

Visitor counting uses [GoatCounter](https://www.goatcounter.com): no cookies, so no consent
banner, and the dashboard is private to your account unless you choose to share it. It runs on
production builds only, so staging visits are never counted.

1. Sign up at goatcounter.com and pick a site code, for example `gabrieleserussi`.
2. Put that code in `goatcounter:` in `src/data/profile.yaml`. The production build refuses to
   run until it is set.
3. In the GoatCounter settings, set the site domain to `gabrieleserussi.github.io` and leave
   "Allow public access to the dashboard" off.

What the dashboard shows: visitors over time, pages, referrers (including people arriving from
ChatGPT, Perplexity, Claude or Google Scholar), countries, browsers, screen sizes, and click
events. Every outgoing link on the site carries a named event, for example
`paper-herbench-arxiv`, `paper-vedje-bibtex`, `hero-email`, `research-himu` or `footer-dblp`,
so you can see which papers people open and how they get in touch. A small no-JavaScript
fallback also counts text browsers and simple fetchers that load images.

AI crawlers (GPTBot, ClaudeBot, PerplexityBot and others) do not run JavaScript, and GitHub Pages
keeps no server logs, so their visits are not visible on this free setup. People who arrive from
an AI assistant do show up, as referrers such as chatgpt.com, perplexity.ai or claude.ai. Seeing
the crawlers themselves would need a custom domain routed through Cloudflare.
