# City Hub Consolidation Plan

## Problem

Every city has two pages competing for the same topical authority:

| Page Type | Example URL | Content |
|-----------|-------------|---------|
| City Hub | `/savannah-ghost-tours/` | Editorial, tours, booking, structured data, FAQ |
| Category Page | `/articles/category/savannah-haunted-history/` | Auto-generated article index, no editorial |

18 cities × 2 pages = 36 URLs where 18 should exist.

This causes keyword cannibalization: Google sees two pages from the same domain
covering the same city's haunted content and splits authority between them.

## Decision

**The city hub is the single authority page per city.**

It already has editorial content, tours, booking links, structured data, and FAQ.
The category page's only unique value — listing articles — gets absorbed into
the city hub.

Non-city categories (dracula-gothic-literature, tour-planning) have no competing
hub page. They keep their category pages.

## Files That Change

### 1. articles.ts — Flag city vs topical categories

```
CATEGORIES entries need a `type` field:

  'savannah-haunted-history': {
    ...
    type: 'city',          // ← NEW
    hubPage: '/savannah-ghost-tours/',
  }

  'dracula-gothic-literature': {
    ...
    type: 'topical',       // ← NEW
    hubPage: '/destinations/draculas-castle/',
  }

  'tour-planning': {
    ...
    type: 'topical',       // ← NEW
    // no hubPage
  }
```

City categories (18): all *-haunted-history + salem-witch-trials + new-orleans-voodoo-haunted-history
Topical categories (2): dracula-gothic-literature, tour-planning

### 2. [category].astro — Skip city categories

The category page generator must skip categories where type === 'city'.

File: src/pages/articles/category/[category].astro

Change getStaticPaths() to filter:

```ts
export async function getStaticPaths() {
  return Object.entries(CATEGORIES)
    .filter(([_, info]) => info.type !== 'city')
    .map(([slug, info]) => ({
      params: { category: slug },
      props: { categorySlug: slug, categoryInfo: info },
    }));
}
```

Result: Only dracula-gothic-literature and tour-planning generate category pages.
18 city category pages stop being built.

### 3. [slug].astro — Breadcrumbs point to city hub, not category page

File: src/pages/articles/[slug].astro

**Breadcrumb JSON-LD (line ~61)**

Currently:
```
"item": `https://cursedtours.com/articles/category/${category.slug}/`
```

Change to:
```ts
// For city categories, breadcrumb points to city hub
// For topical categories, breadcrumb points to category page
const breadcrumbParent = categoryInfo?.type === 'city' && categoryInfo.hubPage
  ? { name: categoryInfo.name, url: `https://cursedtours.com${categoryInfo.hubPage}` }
  : categoryInfo
    ? { name: categoryInfo.name, url: `https://cursedtours.com/articles/category/${category.slug}/` }
    : null;
```

**Visible breadcrumb (line ~107)**

Currently:
```html
<a href={`/articles/category/${category.slug}/`}>
```

Change to:
```ts
const breadcrumbHref = categoryInfo?.type === 'city' && categoryInfo.hubPage
  ? categoryInfo.hubPage
  : `/articles/category/${category.slug}/`;
```

**Category badge (line ~118)**

Currently:
```html
<a href={`/articles/category/${category.slug}/`} ...>
```

Same fix — route to hubPage for city categories.

### 4. sitemap.xml.ts — Remove city category URLs

File: src/pages/sitemap.xml.ts (line 41)

Currently:
```ts
...categories.map(c => entry(`/articles/category/${c}/`, '0.7', 'weekly')),
```

Change to:
```ts
...Object.entries(CATEGORIES)
  .filter(([_, info]) => info.type !== 'city')
  .map(([slug]) => entry(`/articles/category/${slug}/`, '0.7', 'weekly')),
```

Result: Only dracula-gothic-literature and tour-planning appear in sitemap.
18 city category URLs removed from sitemap.

### 5. articles/index.astro — Update category navigation

File: src/pages/articles/index.astro

Currently only shows 5 categories. Needs to:
- Show ALL categories (city + topical) but link city ones to the city hub
- Or group differently: "Articles by City" linking to hubs + "Topics" linking to category pages

The articles index page is a content directory — it can link to city hubs
for city categories and to category pages for topical categories.

```ts
const cityCategories = Object.entries(CATEGORIES)
  .filter(([_, info]) => info.type === 'city' && getArticlesByCategory(_).length > 0);

const topicalCategories = Object.entries(CATEGORIES)
  .filter(([_, info]) => info.type !== 'city');
```

### 6. City hub pages — Add articles section

Each city hub page (e.g., src/pages/savannah-ghost-tours.astro) needs an
"Articles & Guides" section that lists the city's articles.

This