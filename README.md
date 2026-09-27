# gabrieleserussi.com

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
| `src/data/profile.yaml` | Name, one-liner, affiliations, About, links, email |
| `src/data/papers.yaml` | Every paper; `selected: true` puts it on the homepage, in file order |
| `src/data/news.yaml` | Dated news; items older than 180 days disappear on their own |
| `src/data/strip.yaml` | The contact-sheet strip under your name |

Text fields accept `[label](url)` links, and `#paper-<id>` jumps to a paper on the homepage.
Anything containing the word `TODO` shows up in the staging panel and blocks production builds.
The `note` field on a paper is never shown on the site, but the repo is public, so keep it factual.

## Media

| What | Where | Notes |
|---|---|---|
| Headshot | `src/assets/headshot.jpg` | 4:5 crop, under 2 MB; optimized at build |
| Strip frames | `src/assets/strip/01.jpg` ... | Count must match `frames` in strip.yaml |
| Teaser video | `public/media/<paper-id>/` | Made by the script below |
| Teaser still | `src/assets/teasers/<paper-id>.png` | Used when there is no video |
| CV | `public/cv.pdf` | Linked from the homepage |
| Link preview | `public/og.png` | 1200x630; added at launch |

Make a teaser from any clip (needs ffmpeg):

```bash
scripts/encode-teaser.sh path/to/clip.mp4 herbench 3 5   # start at 3 s, keep 5 s
```

It writes a 640px H.264 MP4, a smaller WebM (AV1 when available, otherwise VP9) and a poster
frame. Long videos belong on YouTube or Hugging Face, not in this repo: git keeps every
version forever.

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

At launch, add `public/CNAME` containing `gabrieleserussi.com` and set the same domain under
Settings, Pages, Custom domain. Don't add it earlier: the staging site must stay reachable at
gabrieleserussi.github.io. After launch, change HERBench's project link in papers.yaml to
https://gabrieleserussi.com/HERBench/.

## Troubleshooting

- **"Could not resolve @fontsource-variable/mona-sans/full.css"**: change the import at the top
  of `src/layouts/Base.astro` to `@fontsource-variable/mona-sans/wdth.css`.
- **A schema error naming a field**: that entry in the YAML file has a typo or the wrong type.
  The message names the file and the field.
