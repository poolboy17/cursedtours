# Page Hierarchy Schema

## Architecture

Every page declares its identity: what it is, where it sits, who its parent is.
Type definitions live in `src/types/hierarchy.ts`.

### Page Types

| PageType | Level | Description | Count |
|----------|-------|-------------|-------|
| `homepage` | 0 | Site root | 1 |
| `parent` | 1 | City hubs, destinations, topical hubs, experiences | 32 |
| `child` | 2 | Articles (guides + standard) | 61 → 211 |
| `index` | nav | Directory pages (/articles/, /destinations/, /experiences/) | 3 |
| `utility` | nav | About, contact, privacy, terms, editorial policy | 5 |

### Hierarchy

```
Level 0 — HOMEPAGE
  /
  parent: none

Level 1 — PARENT PAGES
  /{city}-ghost-tours/               variant: city        parent: /
  /destinations/{slug}/              variant: destination  parent: /
  /experiences/{slug}/               variant: experience   parent: /
  /articles/category/{slug}/         variant: topical      parent: /articles/
    (only dracula-gothic-literature and tour-planning)

Level 2 — CHILD PAGES
  /articles/{slug}/                  variant: guide|article
    City children    → parent: /{city}-ghost-tours/
    Topical children → parent: /articles/category/{slug}/
```

### Category Types

Categories flagged in `src/data/articles.ts`:

| Type | Behavior | Count |
|------|----------|-------|
| `city` | No category page generated. Children parent to city hub. | 18 |
| `topical` | Category page generated. Children parent to category page. | 2 |

## Validation Rules

Enforced at build time. Any violation = build warning.

```
Rule 1:  Every page MUST declare a pageType
Rule 2:  Every page MUST declare a parent (except homepage)
Rule 3:  Parent URL MUST resolve to an existing page
Rule 4:  Parent level MUST be < child level
Rule 5:  City children MUST parent to /{city}-ghost-tours/ (not a category page)
Rule 6:  No two parent pages may own the same city
Rule 7:  Guide variant requires articleType === 'guide' in article data
Rule 8:  Every city parent MUST have parent = homepage
Rule 9:  Homepage parent MUST be 'none'
Rule 10: Breadcrumb chain must match: homepage → parent → self
```

## Build Order Rule

**Rule 11: Work top-down through the hierarchy.**

When building or fixing pages, start at the highest affected level and work
down. Don't skip ahead to children while the parent level has known issues.

This is a workflow discipline, not a build gate. It keeps us from spending
hours on article generation while the homepage is missing editorial content
or a city hub doesn't exist yet. Fix the parent, then build the children.

### Current Status

```
Level 0 — Homepage
  EXISTS but needs editorial content + structured data
  Links to 8 of 18 city hubs in grid (all 18 via nav)

Level 1 — City Hub Parent Pages (18)
  ✓ All exist, have editorial, tours, FAQ, schema
  ✓ All linked from homepage nav

Level 2 — Articles (61)
  ✓ All breadcrumb to correct parent
  ⏳ 150 more queued in ARTICLE-PLAN.md
```

## Implementation Status

| Step | Description | Status |
|------|-------------|--------|
| 1 | Type definitions (`src/types/hierarchy.ts`) | ✅ Done |
| 2 | Category type flags (`src/data/articles.ts`) | ✅ Done |
| 3 | City category pages removed (`[category].astro`) | ✅ Done |
| 4 | Breadcrumbs point to parent pages (`[slug].astro`) | ✅ Done |
| 5 | Sitemap cleaned (`sitemap.xml.ts`) | ✅ Done |
| 6 | Articles index updated (`articles/index.astro`) | ✅ Done |
| 7 | Build validated (120 → 102 pages) | ✅ Done |
| 8 | Homepage rebuild (Level 0 checklist) | ⏳ Next |
| 9 | Build-time hierarchy validator | ⏳ Planned |
| 10 | City hubs: add articles section | ⏳ Planned |
