# Quality Checklist — Blog Architect

Run before every deploy. No exceptions.

## Per-Article Checks

1. **JSON validates** — `JSON.parse()` succeeds (malformed JSON breaks entire build)
2. **Slug is unique** — No duplicate filenames in `src/data/articles/`
3. **Hub label exists** — `categories[0].slug` matches a key in `HUB_LABELS`
4. **Internal links resolve** — All `href` values point to pages that exist
5. **Hub link present** — Spoke links back to parent hub in first 2-3 paragraphs
6. **Cross-links present** — 2-4 sibling spoke links in body
7. **Continue Reading** — End section has 3-5 links
8. **Excerpt under 160 chars**
9. **Word count accurate** — `readingTime = Math.ceil(wordCount / 265)`

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
