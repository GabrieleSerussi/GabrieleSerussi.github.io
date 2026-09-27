# gabrieleserussi.com

Personal research website for Gabriele Serussi: PhD researcher at the INSIGHT Lab, Ben-Gurion University, and AI Researcher at Decart. Static Astro 7 site, deployed to GitHub Pages by GitHub Actions. Staging is https://gabrieleserussi.github.io. The domain gabrieleserussi.com is switched over at launch.

This repo is public. Everything in it, including this file, YAML comments and the `note` field on papers, is visible to anyone.

## Current state

- The code was written and syntax-checked but has never been built. First job: `npm install astro@7 @astrojs/sitemap @fontsource-variable/mona-sans`, then `npm run dev`, then fix whatever breaks. Keep the design and behavior; fix the code.
- We are in milestone M2 (design pass). See Roadmap.

## Commands

- `npm run dev`: dev server at http://localhost:4321. Use port 4321 for the preview pane.
- `npm run build`: staging build. Pages are noindex and a panel on the homepage lists every open issue.
- `npm run release`: production build. Fails while any issue remains.
- `npm run check:media`: fails on any media file over 2 MB.
- `scripts/encode-teaser.sh <clip> <paper-id> [start] [duration]`: makes a teaser (MP4, WebM, poster).

## How it fits together

- All content lives in `src/data/`: `profile.yaml`, `papers.yaml` (papers with `selected: true` appear on the homepage in file order), `news.yaml` (items expire after 180 days), `strip.yaml` (the hero contact sheet).
- `src/content.config.ts` checks the shape of the data. `src/lib/validate.ts` checks accuracy: strings containing TODO, selected papers missing a tldr or teaser, author lists without Gabriele's name, strip frame counts, headshot and CV.
- `SITE_STAGE` is a repository variable, `staging` by default. Staging means noindex, the issues panel and no analytics. Production means the build fails on any issue. Launch flips the variable; no code change.
- Media locations and naming are in README.md.

## Accuracy rules (the most important section)

- Never invent or guess a fact: venues, dates, numbers, titles, author lists, links. If something isn't confirmed, put `TODO` in the value so the production build blocks on it, and ask Gabriele.
- A venue goes in only after it is publicly announced. Never add work that is under review or unannounced, or anything internal to Decart.
- Author lists match the paper exactly, in order, with `*` for equal contribution. HERBench (CVPR 2026) is co-first with Dan Ben-Ami. The IROS 2024 drone-acoustics paper is co-first with Tamir Shor, not sole first author.
- PREGEN and HiMu are arXiv preprints. Never label them with a conference.
- Lab papers Gabriele isn't an author on, such as EDJE and the lab's Gaussian-splatting registration paper, don't belong on this site.
- The Decart title in `profile.yaml` changes only when Gabriele says Decart approved it.
- Numbers in copy come from the papers themselves.

## Design system: contact sheet

The site is a video contact sheet where only the frames that matter light up: the visual version of the one-liner, "I build video models that spend only the compute they need." That line is fixed; change it only if Gabriele asks.

- Colors (tokens in `src/styles/tokens.css`): Frame white `#F3F5F7` background, Graphite `#1E242C` text, Slate `#5E6873` secondary text, Rule `#D6DCE2` lines and placeholders, Keyframe amber `#F0A500`, Darkroom `#14171B` dark-mode background. Dark mode swaps the neutrals and keeps amber.
- Amber is for marks only: link underlines, lit frames, the favicon. It never carries text and is never the focus ring, because it fails contrast on white.
- Type: Mona Sans Variable, nothing else. The width axis carries the hierarchy: `'wdth' 125` for the name, 112 for headings, 100 for reading, 87.5 for metadata (authors, venues, dates, captions). Sizes 14, 17 (18 on desktop), 21, 36 and 48 px. Lines stay under 68ch.
- Layout: one left-aligned column, 47rem wide at most. Order: hero (name, one-liner, affiliations, links, photo on the right), contact sheet, About, News, Selected research, footer.
- The contact sheet is the only bold element and the only page-load motion. Needed frames light up amber once and the rest dim. No loops. With reduced motion it renders the final state.
- Everything else stays quiet. No cards, shadows, gradients, pill buttons, icons in link rows, eyebrow or all-caps labels, meta strings joined with middle dots, arrows after link text, or numbered markers. Corners are square except a 2px radius on frames, teasers and the BibTeX block.
- Links use the text color with a 2px amber underline. Hover adds an amber wash; focus is a 2px outline in the text color.
- Teasers are 16:9, 3 to 6 second silent loops with a poster frame. They play only while on screen and never with reduced motion or data saver.

## Writing

- First person, plain and specific. Numbers over adjectives. Sentence case for every heading and label.
- No hype words such as "groundbreaking" or "revolutionary", and no "state of the art" without a number.
- A paper tldr is one sentence with the key result. A news item is one line, past tense, and already public.
- Error and empty states say what happened and what to do next. They don't apologize.

## Engineering rules

- Astro 7's compiler is strict: close every tag, and don't rely on HTML auto-correction (for example, no block elements inside `<p>`).
- Astro 7 removes whitespace the way JSX does: text and inline elements split across lines lose the space between them. Keep inline runs on one line, write `{' '}`, or space list items with CSS `gap`.
- Import Zod from `astro/zod` (Zod 4). Node 22.12 or newer.
- Facts come from `src/data` only. Never hardcode them in components.
- Keep the TODO mechanism and the strict production build working.
- Ask before adding any dependency, UI framework, Tailwind or client-side JavaScript. The only page script is the teaser observer, plus GoatCounter in production.
- No third-party requests except GoatCounter in production. Fonts are self-hosted through Fontsource.
- Images go through `astro:assets`; videos through `scripts/encode-teaser.sh`. No file over 2 MB.
- `.claude/worktrees/` and `.claude/settings.local.json` stay out of git.

## Before calling a change done

- `npm run build` passes, and `npm run release` too when the change affects launch readiness.
- Check the homepage at 390px and 1280px wide, in light and dark mode, and with reduced motion. No horizontal scrolling, keyboard focus visible, body text contrast at least 4.5:1.
- Show Gabriele the result in the preview before committing. Commit in small steps with clear messages. Pushing to `main` deploys staging, so ask before pushing.
- Don't touch DNS, Cloudflare, GitHub settings or the stage logic in the deploy workflow, and don't add `public/CNAME` before launch.
- Never create a HERBench page or folder: gabrieleserussi.github.io/HERBench is served from a separate repo.

## Roadmap

- M2, design (now): real headshot, CV, 12 frames from one HERBench example for the strip, teasers for the selected papers, a copy review.
- M3, hardening: a pull-request checks workflow (build, link check with lychee, Lighthouse budgets), Dependabot for npm and GitHub Actions, `public/og.png` at 1200x630, the GoatCounter code in `profile.yaml`, and the hello@ address (Gabriele sets up Cloudflare Email Routing).
- M4, launch (target mid-October 2026): set `SITE_STAGE=production`, add `public/CNAME` containing `gabrieleserussi.com`, and point HERBench's project link at https://gabrieleserussi.com/HERBench/. Gabriele switches DNS and sets the custom domain with Enforce HTTPS. Then verify: apex returns 200, www redirects to the apex, http redirects to https, gabrieleserussi.github.io redirects to the domain, and /HERBench/ returns 200.
- Later: a PREGEN project page, then a longer research post.
