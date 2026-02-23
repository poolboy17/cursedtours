# Page Templates — Blog Architect

## Layout A: Hub With Sidebar (Affiliate Magazine Pattern)

**Use for:** Hub pages, blog pillar, destination pages. Goal = discovery + conversion.

```html
<!-- Reading progress bar -->
<div id="reading-progress" class="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[var(--accent)] to-[var(--cta)] z-50" style="width:0%"></div>

<!-- Desktop: 2-column grid | Mobile: single column -->
<div class="lg:grid lg:gap-10 max-w-6xl mx-auto px-6"
     style="grid-template-columns: 1fr 280px;">
  <div class="article-body prose prose-md lg:prose-lg mt-8 min-w-0">
    <!-- Hub content sections -->
  </div>
  <aside class="hidden lg:block mt-8">
    <div class="sticky top-24 space-y-6">
      <!-- TOC, affiliate product cards, related links -->
    </div>
  </aside>
</div>
<MobileProductCards products={products} />
```

### Hub Page Anatomy
1. Hero section (title, tagline, topic nav pills)
2. Intro paragraph with hook
3. "Why [Topic] Matters" section with stat boxes
4. Content sections (3-5) with pull quotes
5. Spoke articles grid (ALL spokes for this hub)
6. FAQ section with schema.org FAQPage markup
7. CTA section linking to 3 other hubs (cross-linking)
8. Schema.org BreadcrumbList JSON-LD

**Hub cross-linking:** Each hub's CTA links to 3 other hubs. Every hub should get 2-4 inbound hub-to-hub links.

## Layout B: Clean Prose (Authority Content Pattern)

**Use for:** Spoke articles, blog posts. Goal = trust + deep reading.

```html
<div id="reading-progress" class="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[var(--accent)] to-[var(--cta)] z-50" style="width:0%"></div>

<!-- Dark hero header -->
<div class="bg-[var(--hero-bg)] pt-8 pb-8 border-b-[3px] border-[var(--cta)]">
  <div class="max-w-3xl mx-auto px-6">
    <!-- Breadcrumbs, H1 title, excerpt, meta (date, author, reading time) -->
  </div>
</div>

<!-- 2-column with sidebar -->
<div class="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10 max-w-6xl mx-auto px-6">
  <div class="article-body prose prose-md lg:prose-lg mt-8 min-w-0">
    <!-- Article HTML content -->
  </div>
  <aside class="hidden lg:block mt-8">
    <div class="sticky top-24 space-y-6">
      <!-- TOC with active highlighting -->
      <!-- Contextual affiliate CTA (hub-aware) -->
      <!-- Related spokes widget -->
    </div>
  </aside>
</div>
<!-- Author bio, tags, sharing below the grid -->
```

## Homepage

Links to every hub + blog pillar. Top of the link hierarchy.

```html
<!-- Hero with site identity + value proposition -->
<!-- Featured hub cards (grid of all hubs with images, titles, spoke counts) -->
<!-- Blog section: "Guides & Resources" card linking to blog pillar -->
<!-- Optional: latest spoke articles across all hubs -->
<!-- Footer with sitemap links -->
```

## Blog Pillar Page (Optional — `/blog/` or `/guides/`)

Curated landing page for cross-cutting content. NOT a date-sorted archive. Uses **Layout A**.

### Blog Pillar Anatomy
1. Hero (title, description of what the blog covers)
2. Intro paragraph — position as the niche's go-to resource
3. Curated content sections (grouped by theme, NOT chronological):
   - "Getting Started" — explainers, how-tos
   - "Comparisons & Reviews" — vs pages, buyer's guides
   - "Seasonal Picks" — timely/rotating content
   - "Deep Dives" — long-form trend/industry pieces
4. Each section: 3-5 blog post cards
5. Sidebar: tag filter, "Popular guides" widget, newsletter CTA
6. Bottom CTA linking to 3-4 hub pages

## Blog Post Pages (Optional — `/blog/[slug]`)

Uses **Layout B**. Sidebar differs from spoke articles:
- "More Guides" link to blog pillar
- "Related Topics" links to 2-4 hub pages (from `relatedHubs` array)
- Related blog posts widget (instead of related spokes)
- Breadcrumb: Home > Blog > Post Title

## Static Pages (About, Contact, Privacy, Terms)

Simple centered prose, no sidebar:
```html
<div class="max-w-3xl mx-auto px-6 py-12">
  <h1>Page Title</h1>
  <!-- Content -->
</div>
```
