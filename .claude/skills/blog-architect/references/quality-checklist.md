# Quality Checklist — Blog Architect

Run before every deploy. No exceptions.

## Per-Article Checks

Checks are tiered. **BLOCK** = article cannot be saved/deployed. **WARN** = should fix but doesn't prevent save.

### BLOCK — Must Pass (structural integrity)

1. **B1 JSON validates** — `JSON.parse()` succeeds (malformed JSON breaks entire build)
2. **B4 No H1 in body** — Template handles title; duplicate H1 = broken HTML structure
3. **B6 Word count ≥1,000** — Thin content is genuinely penalized by search engines
4. **B7 No banned phrases** — AI-sounding filler ("delve into", "tapestry of") harms E-E-A-T
5. **B8 No mojibake** — Zero garbled characters (`â€"`, `â€™`, `Ã©`, etc.). See writer-guide.md encoding section
6. **B10 No self-links** — Article must not link to itself
7. **B11 No broken internal links** — All `/articles/{slug}/` links must resolve to real articles
8. **B14 Featured image** — `featuredImage.sourceUrl` and `altText` both present

### WARN — Should Fix (SEO best practices, tracked not enforced)

9. **B2 Title ≤60 chars** — Google rewrites ~76% of titles; long titles get truncated, not penalized
10. **B3 Excerpt ≤155 chars** — Google rewrites 60-70% of descriptions; optimize for clarity
11. **B5 H2 count 4-8** — Editorial preference; semantic search rewards topic breadth, not heading count
12. **B9 ≥3 body links** — Internal linking helps but 2 links shouldn't prevent saving
13. **B12 Keyword in title** — Semantic search doesn't require exact match
14. **B13 Keyword in first 100 words** — Topic coverage matters more than keyword placement
15. **W1 wordCount field set** — Calculated field for rendering
16. **W2 readingTime field set** — `Math.ceil(wordCount / 265)`
17. **W3 articleType set** — "standard" or "pillar"
18. **W4 pageType set** — "hub-spoke"
19. **W5 Continue Reading footer** — End section with 3-5 links
20. **W6 Hub link in body** — Spoke links back to parent hub
21. **W7 ≥2 sibling links** — Cross-links to related spokes

### Always Verify After Writing

22. **Slug unique** — No duplicate filenames in `src/data/articles/`
23. **Hub label exists** — `categories[0].slug` matches a key in `HUB_LABELS`
24. **File encoding** — Written with `encoding='utf-8'` + `ensure_ascii=False`

## Per-Blog-Post Checks (if blog layer enabled)

1. **`relatedHubs` has 2-4 entries** — each matches a valid hub key
2. **Links into multiple hubs** — body text contains links to ≥2 hub pages
3. **Blog pillar link present** — breadcrumb or "More Guides" callout
4. **No single-hub dependency** — if it only links to one hub, it's a spoke, not a blog post

## Site-Wide Checks

1. **Build**: `npx astro build` — confirm page count, zero errors
2. **Lint**: `npx eslint src/` — no code issues
3. **Format**: `npx prettier --check "src/**/*.astro"` — consistent formatting
4. **Link audit**: `node scripts/internal-linking-audit.mjs --dry-run`
   - Every spoke has ≥2 inbound links
   - Every hub has ≥2 inbound hub-to-hub links
   - No orphan pages (0 inbound links)
   - No broken internal links
5. **Schema check**: Spot-check 3 pages for valid JSON-LD (FAQPage on hubs, BreadcrumbList everywhere)
6. **Mobile check**: Sidebar collapses, mobile product cards appear, reading progress works

## Color Contrast Check

Verify all text elements meet WCAG 2.1 AA minimum contrast ratios:

| Element | Requirement | Minimum Ratio |
|---------|------------|---------------|
| Body text | Normal text (< 18px or < 14px bold) | **4.5:1** |
| Headings | Large text (≥ 18px or ≥ 14px bold) | **3:1** |
| Links | Must be distinguishable from surrounding text | **3:1** vs background AND visually distinct from body text |
| Breadcrumbs | Typically small/muted — easy to fail | **4.5:1** (they're normal-sized text) |
| Sidebar text | Muted helper text, labels | **4.5:1** |
| CTA buttons | Button text on colored background | **4.5:1** |
| Placeholder text | Input placeholders | **4.5:1** (often fails — check explicitly) |

### How to Check

Run a programmatic contrast audit after build. For each CSS color pairing (text color vs background):

```javascript
// WCAG relative luminance
function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const parse = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const L1 = luminance(...parse(hex1));
  const L2 = luminance(...parse(hex2));
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

### Common Failures to Watch For

- **Breadcrumbs on dark hero backgrounds** — gray text on dark navy often fails
- **Muted meta text** (dates, reading time) on hero sections
- **Sidebar labels** ("In this article", "Related") — often too faint
- **Link hover states** — hover color must also pass contrast
- **Dark mode** — recalculate all ratios against dark backgrounds

### Fix Strategy

When a color fails contrast, adjust the failing color (not the background) toward white (on dark bg) or toward black (on light bg) until ratio passes. Use CSS custom properties so the fix propagates site-wide.

## Internal Linking Audit Script

The audit script (`scripts/internal-linking-audit.mjs`) maps the full site link graph:
- Hub ↔ spoke integrity (bidirectional links)
- Hub ↔ hub cross-linking balance
- Blog post ↔ hub bridge connections (if blog layer enabled)
- Orphan detection (pages with <2 inbound links)
- Missed cross-link opportunities
- Auto-fix mode inserts missing "Continue Reading" sections

Run after every batch of new content.

## Deploy Sequence

1. Lint & format → fix issues
2. `npx astro build` → confirm page count, zero errors
3. `git add <specific files>` → never `git add .`
4. Commit via `.bat` file in `scripts/` (Windows CMD quote mangling)
5. `git push origin main` → Netlify auto-deploys
