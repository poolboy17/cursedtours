# Cursed Tours — SEO Checklist

> Reference for every new page, article, or hub added to the site.
> Last updated: 2026-03-15

---

## New Article (src/data/articles/{slug}.json)

- [ ] `featuredImage.sourceUrl` is set (full URL, not relative path)
- [ ] `featuredImage.altText` is descriptive (not empty, not filename)
- [ ] `excerpt` is 120–160 characters
- [ ] `title` is under 60 characters
- [ ] `date` and `modified` are set
- [ ] `keywords` array has 3–8 relevant terms
- [ ] `categories[0].slug` maps to a valid entry in `CATEGORIES` in articles.ts
- [ ] Article is linked from its city hub page (related articles section)

## New Hub Page (src/pages/{city}-ghost-tours.astro)

- [ ] `<Layout>` has `title`, `description`, `canonical`, `ogImage` props set
- [ ] `ogImage` points to `/images/heroes/{city}-hero.webp` (not og-homepage.webp)
- [ ] FAQPage JSON-LD is present with at least 4 questions
- [ ] BreadcrumbList JSON-LD is present
- [ ] TouristAttraction JSON-LD is present (import from cityMeta.ts)
- [ ] City key exists in `src/data/cityMeta.ts`
- [ ] City key exists in `src/data/cityTours.ts` with at least one tour
- [ ] Hero image exists at `public/images/heroes/{city}-hero.webp`
- [ ] Hub is linked from the homepage and sitemap

## On Every Deploy

- [ ] Build is clean: `npm run build` — zero errors, no unexpected warnings
- [ ] Lighthouse SEO score is 100
- [ ] `robots.txt` references the correct sitemap URL
- [ ] `rss.xml` renders valid XML (paste into browser to check)

---

## Schema Types in Use

| Page Type        | Schema Types                                              |
|------------------|-----------------------------------------------------------|
| Hub pages        | FAQPage, BreadcrumbList, TouristAttraction                |
| Article pages    | Article, BreadcrumbList                                   |
| Homepage         | WebSite                                                   |
| Destination pages| TouristDestination (via destinations.ts)                  |

---

## GSC Request Indexing — Priority Order

Submit via GSC URL Inspection → Request Indexing (max 10/day):

1. New hub pages (/{city}-ghost-tours/) — highest priority
2. most-haunted-places-in-{city} articles — high priority
3. Other new articles — standard priority

**Unindexed hubs as of 2026-03-15:**
- /salem-ghost-tours/
- /paris-ghost-tours/
- /rome-ghost-tours/
- /washington-dc-ghost-tours/
- /san-antonio-ghost-tours/
- /st-augustine-ghost-tours/
- /chicago-ghost-tours/ (stale — last crawled Jan 29)

---

## Pinterest / Social

- [ ] All hub pages have city-specific `ogImage` (not the generic homepage image)
- [ ] All article JSONs have `featuredImage.sourceUrl` set
- [ ] RSS feed is live and valid: https://cursedtours.com/rss.xml
- [ ] RSS feed is connected to Pinterest board

---

## E-E-A-T Signals

- [ ] Article JSON-LD `author` includes both Person and Organization
- [ ] Editorial policy page is linked from footer
- [ ] About page exists and references expertise
