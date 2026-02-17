# CursedTours.com

Ghost tour discovery platform built with Astro. Static site, zero runtime dependencies.

## Stack

- **Framework**: Astro 4
- **Styling**: Tailwind CSS
- **Hosting**: Netlify (auto-deploys from `main`)
- **Content**: Static JSON articles + Astro hub pages
- **Images**: Pixabay / Unsplash API → `.webp` (800×450)

## Architecture: Hub-and-Spoke SEO Model

The site uses a **hub-and-spoke** content model for SEO:
- **Hub pages** (`src/pages/{city}-ghost-tours.astro`) — long-form city guides
- **Spoke pages** (`src/data/articles/{slug}.json`) — individual articles linked from hubs
- **Blog hubs** (`src/data/blogHubs.ts`) — topic hubs (Salem, Vampire, Prison, etc.)
- **Target**: 10 spoke articles per hub

### Content Inventory (216 pages)

| Type              | Count |
|-------------------|-------|
| City hub pages    | 15    |
| Blog hub pages    | 5     |
| Article spokes    | 170   |
| Destination pages | 7     |
| Experience pages  | 6     |
| Utility pages     | 5     |
| Sitemap + robots  | 2     |

### Key Data Files

| File | Purpose |
|------|---------|
| `src/data/articles.ts` | CATEGORIES definition (single source of truth for city→hub mappings) |
| `src/data/blogHubs.ts` | Blog hub configuration (Salem, Vampire, Tower of London, etc.) |
| `src/data/destinations.ts` | Destination page data |
| `src/data/articles/*.json` | Individual article content (170 files) |
| `public/images/articles/*.webp` | Hero images for articles |

## Setup
```bash
git clone https://github.com/poolboy17/cursedtours-astro.git
cd cursedtours-astro
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your-openai-key
UNSPLASH_ACCESS_KEY=your-unsplash-key
PIXABAY_API_KEY=your-pixabay-key
```

- **OPENAI_API_KEY** — Used for content generation scripts
- **UNSPLASH_ACCESS_KEY** — Image sourcing (higher quality, 50 req/hr free tier)
- **PIXABAY_API_KEY** — Image sourcing fallback (more generous rate limits)

### Development

```bash
npm run dev      # localhost:4321
npm run build    # static build → dist/
npm run test     # build + hub audit
```

## Deployment
Push to `main` → Netlify auto-deploys.

**Netlify settings** (`netlify.toml`):
- Build command: `npm run build`
- Publish directory: `dist`

## ⚠️ Known Gotchas

### Global `.gitignore` blocks `src/data/`

There is a **global gitignore** (`~/.gitignore_global`) with a `data/` rule that
blocks all files under `src/data/`. This means new files in `src/data/` (articles,
config files) will be silently ignored by `git add`.

**Always use `git add -f` when adding new files under `src/data/`:**

```bash
git add -f src/data/articles/my-new-article.json
git add -f src/data/blogHubs.ts
```

If you skip the `-f` flag, files won't be staged, won't be committed, and the
**Netlify build will fail** with "Could not resolve" errors because the files
exist locally but aren't in the repo.

### Project `.gitignore` blocks `*.py`

Python utility scripts (image fetchers, audit scripts, article generators) are
ignored by `*.py` in `.gitignore`. To commit a new Python script:

```bash
git add -f my-script.py
```
## Utility Scripts

| Script | Purpose |
|--------|---------|
| `fetch_missing_images.py` | Fetch hero images from Pixabay/Unsplash, convert to `.webp`, update article JSON |
| `fix_featured_images.py` | Batch-fix `featuredImage` fields in article JSONs |
| `article_utils.py` | Shared helpers for article JSON manipulation |

### Image Fetching Workflow

```bash
# Dry run — shows which articles are missing images
python fetch_missing_images.py

# Actually fetch + convert + update JSONs
python fetch_missing_images.py --fetch

# Only fetch for articles matching a keyword
python fetch_missing_images.py --fetch --only key-west
```

The script:
1. Scans `src/data/articles/*.json` for articles without a matching `.webp` in `public/images/articles/`
2. Looks up curated search terms (or auto-generates from slug)
3. Queries Pixabay API (falls back from Unsplash if needed)
4. Downloads, smart-crops to 800×450, converts to `.webp` at 80% quality
5. Updates the article JSON's `featuredImage` with the local path

**Remember:** Commit new images AND updated JSONs, and use `git add -f` for any new JSON files under `src/data/`.


## Adding Content

### New Article (Spoke)

1. Create `src/data/articles/{slug}.json` with required fields:
   - `slug`, `title`, `metaDescription`, `content` (HTML string)
   - `categories` array linking to parent hub(s)
   - `featuredImage` with `sourceUrl`, `altText`, `width`, `height`
2. Add a hero image at `public/images/articles/{slug}.webp` (or use `fetch_missing_images.py`)
3. Ensure the article's category slug matches an entry in `CATEGORIES` (`src/data/articles.ts`)
4. Stage with force flag: `git add -f src/data/articles/{slug}.json`
5. Commit and push to deploy

### New City Hub Page

1. Create `src/pages/{city}-ghost-tours.astro`
2. Add the city to `CATEGORIES` in `src/data/articles.ts`
3. Create at least 5 spoke articles (target: 10)
4. Stage the hub: `git add src/pages/{city}-ghost-tours.astro`
5. Stage data files: `git add -f src/data/articles.ts`
6. Commit and push

### New Blog Hub

1. Add the hub config to `src/data/blogHubs.ts`
2. Create the hub page in `src/pages/`
3. Create spoke articles with matching category slugs
4. Stage: `git add -f src/data/blogHubs.ts`
5. Commit and push

## Project Structure

```
cursedtours-astro/
├── public/
│   └── images/articles/     # .webp hero images (170+)
├── src/
│   ├── data/
│   │   ├── articles/        # Article JSON files (170)
│   │   ├── articles.ts      # CATEGORIES — single source of truth
│   │   ├── blogHubs.ts      # Blog hub configurations
│   │   └── destinations.ts  # Destination page data
│   ├── layouts/
│   ├── pages/               # Astro pages (hubs, articles, etc.)
│   └── components/
├── fetch_missing_images.py  # Image fetcher script
├── netlify.toml             # Netlify deploy config
├── .env                     # API keys (not committed)
└── .gitignore
```
