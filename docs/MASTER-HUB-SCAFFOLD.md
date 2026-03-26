# Master Hub Rebuild: index.astro

## Current State (Problems)

1. **Zero editorial content** — all taglines and UI labels. No topical authority signal.
2. **Only 8 of 18 city hubs linked** — missing 10 cities from the cluster grid.
3. **No structured data** — no WebSite schema, no Organization schema, no FAQPage schema.
4. **H1 is just "Cursed Tours"** — wastes the most important on-page SEO element.
5. **Generic filler copy** — "Discover the most outstanding articles in all topics of life" (placeholder text still live).
6. **No internal links to article clusters** — the 61 articles feed authority up but the master hub doesn't acknowledge they exist.
7. **No FAQ section** — misses FAQPage rich snippet opportunity for "ghost tours" queries.
8. **Search box is non-functional** — form with no action.

## Target Architecture

### Section Order

```
1. Hero
   - H1: keyword-rich (e.g., "Ghost Tours & Haunted Experiences Worldwide")
   - Subhead: value proposition
   - CTA: Browse by city or search

2. Trust Indicators (keep, refine copy)

3. City Hub Grid — ALL 18 CITIES
   - Grouped by region (US / International)
   - Every city links to its hub page
   - Brief tagline per city (not just a name)
   - This is the primary routing section

4. Editorial Authority Section — NEW (~600-800 words)
   H2: "What Is a Ghost Tour?"
   - What ghost tours are, who they're for, what to expect
   - Types of tours (walking, pub crawl, cemetery, paranormal investigation)
   - Links to tour-planning guide articles naturally

   H2: "The Most Haunted Cities in the World"
   - Brief overview of why these specific cities
   - Historical context: plague, war, slavery, disasters create hauntings
   - Natural contextual links to 4-5 top city hubs within the prose

   H2: "How to Choose the Right Ghost Tour"
   - Duration, group size, historical vs theatrical, family-friendly
   - Links to tour-planning cluster articles

5. Featured Destinations (keep — Dracula, Salem, Tower)

6. Latest Articles Section — NEW
   - Pull 6 most recent articles dynamically
   - Shows Google the site has active content depth

7. FAQ Section — NEW
   - 6-8 questions targeting "ghost tours" search intent
   - FAQPage schema markup
   - Questions like:
     - "Are ghost tours scary?"
     - "What should I wear on a ghost tour?"
     - "Are ghost tours suitable for children?"
     - "What's the most haunted city in America?"
     - "How long do ghost tours last?"
     - "Do ghost tours run in the rain?"

8. Structured Data
   - WebSite schema (with SearchAction for sitelinks search box)
   - Organization schema
   - FAQPage schema
   - BreadcrumbList (Home only, since it IS home)
```

## Pre-Existing Content We Can Link To

The editorial section should naturally reference these existing articles:
- /articles/ghost-tours-guide/ (pillar — comprehensive guide)
- /articles/walking-ghost-tour-guide/
- /articles/ghost-tours-with-kids/
- /articles/ghost-tours-for-skeptics/
- /articles/cemetery-ghost-tours/
- /articles/ghost-tour-pub-crawls/
- /articles/what-to-wear-ghost-tour/
- /articles/ghost-tours-for-couples/

And these city hubs:
- All 18 city hub pages

## SEO Targets

- **Primary keyword**: "ghost tours"
- **Secondary**: "haunted tours", "ghost tours near me", "best ghost tours"
- **Long-tail**: captured by FAQ section
- **Content depth**: 600-800 words editorial + FAQ = ~1,000+ words total text
- **Internal links**: 25+ outbound links to city hubs + articles
- **Structured data**: WebSite + Organization + FAQPage

## Implementation

This is a single-page rebuild of src/pages/index.astro.
The visual design stays — we're adding content sections, not redesigning.
