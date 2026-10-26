# gabrieleserussi.github.io

Personal research website for Gabriele Serussi: PhD researcher at the INSIGHT Lab, Ben-Gurion University, and Research Intern at Decart. Static Astro 7 site, deployed to GitHub Pages by GitHub Actions. It lives at https://gabrieleserussi.github.io for good: Gabriele chose a completely free site on 2026-10-25, so there is no custom domain, no `public/CNAME` and no Cloudflare.

This repo is public. Everything in it, including this file, YAML comments and the `note` field on papers, is visible to anyone.

## Current state

- The site builds with Astro 7.3 on Node 24, and `package-lock.json` is committed. On Gabriele's Mac, Node is Homebrew's keg-only `node@24`, so commands need `/opt/homebrew/opt/node@24/bin` on PATH. Keep the design and behavior; fix the code.
- The site is live at https://gabrieleserussi.github.io (launched 2026-10-25). Pushing to `main` deploys production directly, so ask before pushing. Gabriele supplied the Decart start date (May 2026), his DBLP page (verified) and his contact email serussig@post.bgu.ac.il on 2026-10-25. On 2026-10-25 the site was rebuilt in the editorial style after a study of seven researcher sites Gabriele admires (Yanjie Ze, Chung Min Kim, Xichen Pan, Jiankai Sun, Botao He, Yihuai Gao, Roy Amoyal). He chose it over a classic academic and the earlier cinematic version, and said he is attached to no style: the most effective site wins. Gabriele dropped the CV link.

## Commands

- `npm run dev`: dev server at http://localhost:4321. Use port 4321 for the preview pane.
- `npm run build`: staging build. Pages are noindex and a panel on the homepage lists every open issue.
- `npm run release`: production build. Fails while any issue remains.
- `npm run check:media`: fails on any media file over 2 MB.
- `scripts/encode-teaser.sh <clip> <paper-id> [start] [duration] [width]`: makes a teaser (MP4, WebM, poster); width defaults to 640.

## How it fits together

- All content lives in `src/data/`: `profile.yaml` (identity, credentials, research pillars, timeline, links), `papers.yaml` (papers with `selected: true` appear on the homepage in file order), `news.yaml` (items expire after 180 days).
- `src/content.config.ts` checks the shape of the data. `src/lib/validate.ts` checks accuracy: strings containing TODO, highlighted papers missing a hook or teaser, research pillars naming unknown papers, author lists without Gabriele's name, missing logos, headshot and CV.
- `SITE_STAGE` is a repository variable, `staging` by default. Staging means noindex, the issues panel and no analytics. Production means the build fails on any issue. Launch flips the variable; no code change.
- Media locations and naming are in README.md.

## Accuracy rules (the most important section)

- Never invent or guess a fact: venues, dates, numbers, titles, author lists, links. If something isn't confirmed, put `TODO` in the value so the production build blocks on it, and ask Gabriele.
- A venue goes in only after it is publicly announced. Never add work that is under review or unannounced, or anything internal to Decart.
- Author lists match the paper exactly, in order, with `*` for equal contribution. HERBench (CVPR 2026) is co-first with Dan Ben-Ami. The IROS 2024 drone-acoustics paper is co-first with Tamir Shor, not sole first author.
- PREGEN is an arXiv preprint; never label it with a conference. HiMu was accepted at WACV 2027 (Gabriele confirmed on 2026-10-25; WACV released round 1 final decisions in October 2026, and the arXiv page does not mention it yet).
- VEDJE appeared at the ICML 2026 AdaptFM workshop and on arXiv (2610.11850). The arXiv PDF marks Shahaf Wagner and Gabriele Serussi as equal contributors, so it is co-first; the site uses the arXiv BibTeX.
- PREGEN has three co-first authors (Gabriele Serussi, David Vainshtein, Jonathan Kouchly), as the arXiv PDF marks them. Structured Diffusion Bridges is ICML 2026 with Eitan Kosman as first author (OpenReview, arXiv comment). The IROS 2024 paper was accepted as an oral pitch presentation (Gabriele confirmed it).
- Lab papers Gabriele isn't an author on, such as EDJE and the lab's Gaussian-splatting registration paper, don't belong on this site.
- Gabriele's Decart title is "Research Intern" (he confirmed it on 2026-09-27). Change it only when he says so.
- Numbers in copy come from the papers themselves.
- News about a talk or poster is written in the passive ("was presented") unless Gabriele confirms he presented it himself.
- Education and dates come from his ORCID record: BSc Computer Engineering, Sapienza University of Rome (2018 to 2021); MSc Computer Science, Technion (2021 to 2024), advised by Prof. Alex Bronstein and Prof. Chaim Baskin (Gabriele confirmed both); PhD, Electrical and Computer Engineering, Ben-Gurion University (Nov 2024 to present), advised by Prof. Chaim Baskin.
- Impact figures such as "11k+ dataset downloads" carry their source and date in a YAML comment. Refresh them from the source; never round up.

## Design system: editorial

A white page where the work carries the colour. The mission line, "I build world models that spend only the compute they need.", is fixed; change it only if Gabriele asks.

What the seven reference sites taught, and this site follows:
- Identity and credentials in the first lines: photo, name, mission, institution, advisor, company, degrees, profile links. Advisors and institutions are the strongest trust signals in academia.
- Show the work as moving pictures before text (Yanjie Ze's highlights grid): every highlight has a teaser, a venue badge, a short name and one result with its baseline.
- A research vision that ties the papers together (Jiankai Sun's pillars): each pillar names the papers that back it.
- Status badges for venues and recognition (oral pitch, downloads), and one explicit call to action in a callout (Botao He).
- An experience and education timeline with logos (Xichen Pan, Botao He, Roy Amoyal).
- Restraint: one accent colour, generous space, light by default with dark mode.

Tokens live in `src/styles/tokens.css`:
- Colors: page `#FFFFFF`, surface `#F6F6F4`, lines `#EBEBEB` and `#D4D4D4`, ink `#141414`, muted `#5A5A5A`, accent vermilion `#B23A12`, with a dark palette under `prefers-color-scheme: dark` (accent `#FF8F66`, dark text on accent fills). Every text pair is at least 4.5:1; the comments give the ratios.
- Type: Newsreader Variable (serif, with italic) for the name, mission, headings and paper titles; Mona Sans Variable for everything else. Both are self-hosted through Fontsource. Gabriele approved the Newsreader dependency on 2026-10-25.
- Layout: a 68rem container. Order: nav, hero (round photo left; name, italic mission, credentials, profile pills, callout, colour logos right), Highlights (four cards), Research (lede, three pillars with paper chips, one thread line), News, Selected publications (all selected papers in file order; PREGEN as a brief row with badges instead of a teaser), Experience and education, Get in touch, footer.
- Paper order follows `papers.yaml`, which is Gabriele's priority order: HERBench, Structured Diffusion Bridges, HiMu, the IROS paper, VEDJE, PREGEN.
- `emphasis` sets the room a paper gets: `lead` papers are highlight cards and full rows (HERBench, SDB, HiMu, IROS), `standard` papers are full rows with a teaser (VEDJE), `brief` papers are one row without teaser or tldr on the homepage (PREGEN).
- Every paper in `papers.yaml` gets its own page at `/research/<id>/` (`src/pages/research/[id].astro`): badges, title, authors, the hook as lead, link buttons, the teaser, the key result, the published abstract, BibTeX, topics and related papers from the same research pillar. Homepage titles, highlight cards, research chips and news link there. Each page carries Google Scholar citation tags, a ScholarlyArticle graph with the abstract, and the teaser as its preview image. The `abstract` field is the published text verbatim (only LaTeX markup removed), so the style rules do not apply to it.
- Logos in `src/assets/logos/`: `<name>.png` in colour, `<name>-dark.png` in white for dark mode, `<name>-mark.png` square for the timeline. The Sapienza mark is the seal from the official logo in the uniroma1.it header.
- Motion: none on load. Teasers zoom slightly on hover and the HERBench clip loops only while on screen; both stop with reduced motion.
- Avoid: more than one accent colour, gradients, icons in link rows, all-caps labels, and dashes in copy.

## Positioning

- The audience is research hiring managers and recruiters at labs working on world models, video and robotics, potential collaborators, and AI assistants answering questions about these topics. The first screen answers who, what, proof and how to reach him in five seconds.
- The pitch: world models that spend only the compute they need. Three pillars (understand, generate, act) carry the breadth; efficiency is the thread, from representation learning down to hardware. Hardware optimization is a recent direction without publications; mention it as an interest, never as results.
- The call to action is collaboration (Gabriele's choice, 2026-10-25), not a job search.
- Personal names appear only in author lists and as advisors: Prof. Chaim Baskin (PhD and MSc) and Prof. Alex Bronstein (MSc), and as supervisors: Prof. Chaim Baskin and Dotan Di Castro (Bosch). PREGEN gets no highlight; it appears as a brief preprint row.
- Copy leads with what most makes a reader want to read more (Gabriele, 2026-10-25), optimised first for people and then for AI assistants. A highlight `hook` is the most intriguing fact in plain words. A `tldr` opens with the result, then names the task (for example "long-video question answering") so search engines and assistants can match it. `keywords` hold task, method and dataset terms for the structured data and `llms-full.txt`.

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
- Search and AI assistants: the homepage carries a JSON-LD graph (ProfilePage, WebSite, Person, a ScholarlyArticle per paper) built in `src/lib/seo.ts`, `rel="me"` profile links, and `public/og.png`. `/llms.txt` and `/llms-full.txt` summarize everything in plain text. Keep them in sync with the data by generating them, never by hand. For AI assistants (GEO, 2026-10-26): the Person node also carries the INSIGHT Lab as `memberOf`, the ORCID iD and topics tied to Wikipedia pages; `/bio/` holds third-person bios (he/him) that an assistant can quote, and llms.txt opens with quick facts; robots.txt names the AI crawlers; every sitemap entry's lastmod is the last commit date; after each production deploy the workflow pings IndexNow so Bing, which ChatGPT search and Copilot use, recrawls (the key file is in `public/`). Never state where Gabriele is based, on the page, in the structured data or in llms.txt (his choice, to avoid harassment); naming Israel's ministry as the grant's funder is fine.
- No third-party requests except GoatCounter in production. Fonts are self-hosted through Fontsource.
- Analytics: GoatCounter with a private dashboard (Gabriele asked for it on 2026-10-25). Tag every new link with `data-goatcounter-click={track(...)}` from `src/lib/site.ts`. AI crawlers are not visible on the free github.io setup (see README).
- Images go through `astro:assets`; videos through `scripts/encode-teaser.sh`. No file over 2 MB.
- `.claude/worktrees/` and `.claude/settings.local.json` stay out of git.

## Before calling a change done

- `npm run build` passes, and `npm run release` too when the change affects launch readiness.
- Check the homepage at 390px and 1280px wide, in light and dark mode, and with reduced motion. No horizontal scrolling (open the BibTeX blocks too), keyboard focus visible, text contrast at least 4.5:1, badges included.
- Show Gabriele the result in the preview before committing. Commit in small steps with clear messages. Pushing to `main` deploys the live site, so ask before pushing.
- Don't touch DNS, Cloudflare, GitHub settings or the stage logic in the deploy workflow, and don't add `public/CNAME`: the site stays on the free github.io address.
- Never create a HERBench page or folder: gabrieleserussi.github.io/HERBench is served from a separate repo.

## Roadmap

- M2, design (now): done. See Current state.
- M3, hardening: a pull-request checks workflow (build, link check with lychee, Lighthouse budgets), Dependabot for npm and GitHub Actions, the GoatCounter code in `profile.yaml`. The contact email is his BGU address; a hello@ address on the domain stays optional.
- M4, launch: done on 2026-10-25. The repo GabrieleSerussi/GabrieleSerussi.github.io deploys from `main`, `SITE_STAGE` is `production`, every page and /HERBench/ return 200, and GoatCounter (code `gabrieleserussi`) receives visits.
- Later: a PREGEN project page, then a longer research post.
