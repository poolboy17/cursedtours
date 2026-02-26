---
name: blog-architect
description: >
  Architect and scaffold new affiliate magazine sites from scratch using Astro + Tailwind + Netlify.
  Use this skill when the user wants to build a new affiliate site, start a new niche site, create a new
  magazine-style blog, scaffold a content site, or set up a new Astro project for affiliate marketing.
  Also trigger when they mention "new site build", "spin up a site", "site architecture", "content
  structure", or any reference to creating a fresh affiliate property. This skill orchestrates the full
  pipeline: niche configuration, project scaffolding, page type creation, design system application,
  content generation, quality control, and Netlify deployment.
---

# Blog Architect — New Affiliate Site Builder

Build a **new affiliate magazine site** from scratch. This skill orchestrates the pipeline from niche
selection through deployment, using proven patterns from cursedtours.com, protrainerprep.com, and
devourdestinations.com.

**Reference files** — read these just-in-time as you reach each phase:
- `references/data-schemas.md` — Article JSON, blog post, hub labels, product data models
- `references/page-templates.md` — Layout A (hub+sidebar), Layout B (clean prose), blog pillar, homepage
- `references/writer-guide.md` — Voice, structure, linking rules for spoke articles and blog posts
- `references/quality-checklist.md` — Per-article checks, site-wide checks, link audit, deploy sequence

## Terminology (Use Exactly These Terms)

| Term | Meaning | SEO Role |
|------|---------|----------|
| **Homepage** | Front page. Links to all hubs + blog pillar. | Top of link hierarchy. |
| **Hub pages** | Tier 1. One per topic/city/vertical. | Core topical authority. |
| **Spoke articles** | Tier 2. Long-tail content belonging to one hub. | Organic traffic. Link back to parent hub. |
| **Blog pillar page** | Optional. Curated landing for cross-cutting content. | Second authority cluster. |
| **Blog posts** | Optional. Niche-adjacent, links INTO multiple hubs. | Bridge nodes between hub clusters. |
| **Destination pages** | Tier 2 variant. Specific place/product. Travel sites only. | Same rules as spokes. |
| **Static pages** | About, Contact, Privacy, Terms. | Trust signals. |

**Do NOT use:** "silo," "category page." Categories are internal labels for sorting spokes into hubs — not pages, not SEO structure. The structure IS the link graph: homepage → hubs → spokes → back to hubs. The blog pillar is the one exception — it IS a real page with its own SEO job.

## The Pipeline

1. **Niche Configuration** — Define niche, affiliate program, hub topics, site identity
2. **Project Scaffold** — Init Astro + Tailwind, configure Netlify, set up repo
3. **Data Architecture** — Create content data model → read `references/data-schemas.md`
4. **Page Types** — Build templates using two core layouts → read `references/page-templates.md`
5. **Design System** — Apply theming via CSS custom properties
6. **Seed Content** — Generate spoke articles → read `references/writer-guide.md`
7. **Quality Control** — Lint, build, audit → read `references/quality-checklist.md`
8. **Deploy** — Push to GitHub, auto-deploy via Netlify

## Phase 1: Niche Configuration

Gather these inputs before writing code. Create `site-config.json` in project root:

```json
{
  "siteName": "CursedTours",
  "domain": "cursedtours.com",
  "tagline": "Ghost Tours & Dark History",
  "niche": "ghost tours and haunted history",
  "description": "Affiliate magazine covering ghost tours and dark history across 19 cities.",
  "affiliate": {
    "platform": "Viator",
    "params": { "pid": "P00166886", "mcid": "42383" },
    "urlPattern": "https://www.viator.com/tours/{city}/{tour}/d{destId}-{productCode}?pid={pid}&mcid={mcid}",
    "disclosure": "We earn a commission when you book through our links at no extra cost to you."
  },
  "theme": { "mode": "dark", "accent": "#7c3aed", "accentLight": "#ede9fe", "cta": "#16a34a" },
  "hubs": [
    { "slug": "austin", "label": "Austin Ghost Tours", "pageSlug": "austin-ghost-tours" },
    { "slug": "boston", "label": "Boston Ghost Tours", "pageSlug": "boston-ghost-tours" }
  ]
}
```

### Required Decisions

| Decision | Options | Default |
|----------|---------|---------|
| Affiliate platform | Viator, Amazon Associates, ShareASale, CJ, custom | — |
| Hub structure | City-based, topic-based, product-category | City-based |
| Theme mode | Dark, light, auto | Dark |
| Content format | JSON articles, Markdown/MDX | JSON |

## Phase 2: Project Scaffold

```bash
cd /d D:\headless
npm create astro@latest {project-name} -- --template minimal --no-install --no-git
cd /d D:\headless\{project-name}
npx astro add tailwind -y && npm install
git init && git add -A && git commit -m "Initial scaffold: Astro + Tailwind + Netlify"
gh repo create poolboy17/{project-name} --public --source=. --push
```

Create `netlify.toml`:
```toml
[build]
  command = "npx astro build"
  publish = "dist"
[build.environment]
  NODE_VERSION = "20"
[[redirects]]
  from = "/*"
  to = "/404"
  status = 404
```

Connect Netlify to the GitHub repo for auto-deploy on push to `main`.

## Phase 3: Data Architecture

**Read `references/data-schemas.md` now** for complete TypeScript interfaces and JSON schemas.

### Link Hierarchy

```
Homepage
  ├── Hub Page: Austin Ghost Tours ──→ 8-12 spokes
  │     ├── Spoke: "LaLaurie Mansion True Story" ──→ back to hub + 2-3 sibling spokes
  │     └── Destination: "Driskill Hotel" ──→ back to hub (travel sites only)
  ├── Hub Page: Boston Ghost Tours ──→ 8-12 spokes
  ├── Blog Pillar (/blog/) ──→ all blog posts (optional)
  │     ├── Blog Post: "History of Ghost Hunting Equipment" ──→ links into 3 hubs
  │     └── Blog Post: "Walking vs Bus Tours" ──→ links into 4 hubs
  └── Static Pages
```

### Link Rules

- Homepage links to every hub + blog pillar
- Each hub links to all its spokes
- Each spoke links back to parent hub in first 2-3 paragraphs + cross-links 2-4 sibling spokes
- Hub pages cross-link to 3 other hubs via CTA section
- Blog posts link into 2-4 hubs contextually (no single parent hub)
- Blog posts link back to blog pillar
- Hubs can optionally link to relevant blog posts as supplementary reading

### Scaling

Hub clusters are bounded at 8-15 spokes — beyond that, topical focus dilutes. The blog layer scales independently, absorbing cross-hub and niche-adjacent content with no ceiling.

## Phase 4: Page Types

**Read `references/page-templates.md` now** for full HTML/Astro code templates.

### Layout A: Hub With Sidebar

**Use for:** Hub pages, blog pillar, destination pages. Goal = discovery + conversion.
2-column: `lg:grid` with `1fr 280px`. Sticky sidebar with TOC, affiliate cards, related links.

### Layout B: Clean Prose

**Use for:** Spoke articles, blog posts. Goal = trust + deep reading.
Full-width prose, reading progress bar, light TOC sidebar. Affiliate CTAs in sidebar only.

### Page Type Decision Tree

```
Every site:  ✓ Homepage  ✓ Hubs  ✓ Spokes  ✓ Static pages
Optional:    ✓ Blog pillar + blog posts (when cross-cutting content exists)
Travel only: ✓ Destination pages
```

## Phase 5: Design System

CSS custom properties for theming. One codebase, any palette.

```css
:root {
  --accent: #4f46e5; --accent-light: #eef2ff; --accent-border: #c7d2fe;
  --cta: #16a34a; --hero-bg: #0f172a; --heading-dark: #0f172a;
  --text-strong: #1e293b; --slate-bg: #f1f5f9; --slate-border: #475569;
}
```

| Preset | Accent | CTA | Example |
|--------|--------|-----|---------|
| Dark | `#7c3aed` | `#16a34a` | cursedtours.com |
| Light | `#4f46e5` | `#16a34a` | protrainerprep.com |
| Warm | `#f67280` | `#d4a574` | devourdestinations.com |

Copy from design system (`D:\headless\astro-design-system\patterns\`):
- `styles/article-prose.css` → `src/styles/`
- `components/ReadingProgress.astro`, `TableOfContents.astro`, `SidebarCTA.astro`, `SidebarLinks.astro` → `src/components/`

## Phase 6: Content Generation

**Read `references/writer-guide.md` now** for voice, structure, linking rules, and **character encoding requirements**.

**CRITICAL:** All article JSON files must be written with explicit `encoding='utf-8'` and `ensure_ascii=False`.
Failure causes mojibake — garbled characters from UTF-8 bytes misread as Windows-1252. This was the
root cause of ~50 corrupted articles in the cursedtours.com corpus. See writer-guide.md for details.

**After writing each article, run the post-write validator:**
```bash
python scripts/validate_article.py {slug}
```
This catches encoding bugs, mojibake, banned phrases, and structural errors before they reach production.
Use `--fix` to auto-repair mojibake. Never skip this step.

## Phase 7: Quality Control

**Read `references/quality-checklist.md` now** for per-article and site-wide checks.

The checklist uses a two-tier system aligned with SemanticPipe:
- **BLOCK** = structural integrity (broken JSON, mojibake, thin content, broken links) — must pass
- **WARN** = SEO best practices (title length, keyword placement, heading counts) — tracked, not enforced

After generating articles, run SemanticPipe (`semanticpipe.py --all`) to auto-optimize metadata,
fix mojibake, insert sibling links, compute semantic scores, and validate all BLOCK/WARN checks.

## Phase 8: Deploy

1. Lint & format → fix issues
2. `npx astro build` → confirm page count, zero errors
3. `git add <specific files>` → never `git add .`
4. Commit via `.bat` file in `scripts/` (Windows CMD quote mangling workaround)
5. `git push origin main` → Netlify auto-deploys

## Quick Reference

| What | Where |
|------|-------|
| Homepage | `src/pages/index.astro` |
| Hub pages | `src/pages/{hub-slug}.astro` |
| Spoke template | `src/pages/articles/[slug].astro` |
| Blog pillar | `src/pages/blog/index.astro` (optional) |
| Blog post template | `src/pages/blog/[slug].astro` (optional) |
| Destination template | `src/pages/destinations/[slug].astro` (travel only) |
| Hub labels | `src/data/articles.ts` |
| Spoke JSON | `src/data/articles/{slug}.json` |
| Blog post JSON | `src/data/blog-posts/{slug}.json` (optional) |
| Affiliate products | `src/data/hubProducts.ts` |
| Design system | `D:\headless\astro-design-system\patterns\` |
| Prose CSS | `src/styles/article-prose.css` |
| Theme vars | `src/styles/global.css` |
| Link audit | `scripts/internal-linking-audit.mjs` |

## Environment

Windows. `cmd` shell with `cd /d D:\headless\{project-name} &&` for git. Commits via `.bat` files. Push to `main` triggers Netlify. Use Desktop Commander for file ops.
