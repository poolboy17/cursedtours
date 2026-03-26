# cursedtours.com — Site Status & Context Doc
> Last updated: 2026-03-15
> Load this file at the start of any new session to skip re-discovery.

---

## 1. INFRASTRUCTURE

| Item | Value |
|---|---|
| **Live URL** | https://cursedtours.com |
| **Stack** | Astro static site (SSG) |
| **Deploy** | Netlify (`cursedtours`, site ID: `d6fd8307-58ec-433f-9580-48f580b1feb8`) |
| **Repo** | `D:\dev\projects\cursedtours` |
| **Build command** | `npm run build` → outputs to `dist/` |
| **Deploy command** | `pushd D:\dev\projects\cursedtours && npx netlify-cli deploy --dir dist --site d6fd8307-58ec-433f-9580-48f580b1feb8 --prod` |
| **WP redirect site** | https://wp.cursedtours.com → Netlify (`wp-cursedtours-redirect`, site ID: `eb4fea2a-f950-4e2b-96ac-856ca7993131`) |
| **WP redirect repo** | `D:\dev\projects\wp-cursedtours-redirect` |
| **GSC property** | `sc-domain:cursedtours.com` (siteOwner) |
| **Lighthouse (latest)** | Perf 85–89 / Accessibility 97 / Best Practices 100 / SEO 100 |

---

## 2. MIGRATION HISTORY

### Stage 1 — WordPress
- Full WP site at `cursedtours.com`
- Google indexed `/category/*`, `/tag/*`, `/tour/`, individual tour slugs, `/tours/`, etc.

### Stage 2 — Headless WordPress (~late 2025)
- Next.js/Faust frontend at `cursedtours.com`
- WP backend moved to `wp.cursedtours.com`
- Google accidentally indexed `wp.cursedtours.com` REST API endpoints, tag pages, WP article slugs
- Problem: `wp-json/wp/v2/tags/513/` and others got indexed

### Stage 3 — Full Astro Migration (~late Jan 2026)
- Replaced headless WP with static Astro build
- Architecture changed: WP `/category/*` model → city hub-spoke model
- `wp.cursedtours.com` became a Netlify redirect site (catches WP backend URLs)
- 18-day crawl blackout during migration (Dec 17 – Jan 4)
- Google re-evaluated site through Feb 2026; hub pages settled at pos 70–90 by early March

---

## 3. SITE ARCHITECTURE

### URL Structure
```
/                          → Homepage
/{city}-ghost-tours/       → City hub pages (PRIMARY revenue pages)
/articles/{slug}/          → Article spokes (SEO content)
/blog/{category}/          → Blog category hubs
/destinations/{slug}/      → Destination feature pages
/experiences/{type}/       → Experience type pages (cemetery-tours, pub-crawls, etc.)
/salem-ghost-tours/        → etc. (all city hubs are flat at root)
```

### City Hubs (src/pages/*.astro)
Austin, Boston, Charleston, Chicago, Denver, Dublin, Edinburgh, Key West,
London, Nashville, New Orleans, New York, Paris, Rome, Salem, San Antonio,
Savannah, St. Augustine, Washington DC

### Content Architecture
- Articles: `src/data/articles/{slug}.json` → rendered via `src/pages/articles/[slug].astro`
- City tours data: `src/data/cityTours.ts` (Viator/GetYourGuide affiliate tours per city)
- Destinations: `src/data/destinations.ts`
- **Revenue model**: Viator/GetYourGuide affiliate links in TourSidebar + MobileTourCards components

### Key Components
- `TourSidebar.astro` — desktop sidebar with Viator tour cards (affiliate revenue)
- `MobileTourCards.astro` — mobile tour cards
- `CdnImage.astro` — image optimization via Netlify image CDN
- Each hub has: FAQ schema, BreadcrumbList schema, hero section, category sections, articles grid

---

## 4. GSC STATUS (as of 2026-03-15)

### Current Metrics (28d)
| Metric | Value | Trend |
|---|---|---|
| Clicks | 1–2 | Flat |
| Impressions | ~307 | Growing |
| CTR | 0.4% | Very low |
| Avg Position | ~83 | Deeply buried |

### Top Pages by Impressions (current)
| Page | Impressions | Position |
|---|---|---|
| /edinburgh-ghost-tours/ | 49 | 80 |
| /new-york-ghost-tours/ | 47 | 89 |
| /new-orleans-ghost-tours/ | 46 | 87 |
| /austin-ghost-tours/ | 17 | 81 |
| /charleston-ghost-tours/ | 7 | 19 ← best positioned |
| /chicago-ghost-tours/ | 11 | 49 ← dropped from pos 10 |

### Index Status of Key Pages
- Homepage: Indexed, last crawled 2026-03-06
- Edinburgh: Indexed, last crawled 2026-02-23
- Chicago: Indexed, last crawled 2026-01-29 (STALE — needs recrawl)
- NYC: Indexed, last crawled 2026-02-23
- New Orleans: Indexed, last crawled 2026-01-30

### Pattern
Google sees the pages and is crawling them. Positions are buried (p7-9) because:
1. New domain authority after migration — no WP equity transferred
2. No `/tours/` navigation hub page rebuilt in Astro (was p2.1 in WP)
3. Category pages gone (category/salem was p7.5 — now 301 to city hubs)
4. Chicago specifically dropped p10 → p49 in Feb 2026 (stale crawl, needs attention)

---

## 5. REDIRECT / CLEANUP STATUS

### netlify.toml redirects (cursedtours.com)
All configured as of 2026-03-15:

| From | To | Status |
|---|---|---|
| /category/salem/ | /salem-ghost-tours/ | ✅ 301 |
| /category/charleston/ | /charleston-ghost-tours/ | ✅ 301 |
| /category/rome/ | /rome-ghost-tours/ | ✅ 301 |
| /category/savannah/ | /savannah-ghost-tours/ | ✅ 301 |
| /category/paris/ | /paris-ghost-tours/ | ✅ 301 |
| /category/edinburgh/ | /edinburgh-ghost-tours/ | ✅ 301 |
| /category/london/ | /london-ghost-tours/ | ✅ 301 |
| /tours/ | / | ✅ 301 |
| /tours/* | / | ✅ 301 |
| /terms-of-service/ | /terms/ | ✅ 301 |
| /contact-us/ | /contact/ | ✅ 301 |
| /chicago-haunted-ghost-tour-gps-self-guided-walking-tour/ | /chicago-ghost-tours/ | ✅ 301 |
| /chicago-architecture-and-ghost-tour/ | /chicago-ghost-tours/ | ✅ 301 |
| /ghosts-of-chicago-family-friendly-ghost-tour/ | /chicago-ghost-tours/ | ✅ 301 |
| /affiliate-disclosure/ | /editorial-policy/ | ✅ 301 |
| /cookie-policy/ | /privacy-policy/ | ✅ 301 |
| /* | /404.html | 404 catch-all |

### wp.cursedtours.com
- `robots.txt: Disallow: /` — deployed 2026-03-15
- `_redirects: /* → cursedtours.com/ 301!` — all WP backend URLs redirect to homepage
- Status: Most wp.* pages are NEUTRAL/blocked. `wp-json/wp/v2/tags/513/` was indexed — robots.txt will resolve on next crawl.
- **Action needed ~May 2026**: Run GSC check. If all 14 wp.* pages show 0 impressions, safe to delete Netlify site and DNS record.

### WP artifact cleanup progress
- ~230 individual Viator tour page slugs: 404ing correctly, self-cleaning over 3–6 months
- Old WP content slugs (no article equivalents): 404ing correctly, self-cleaning
- URL removal requests submitted via GSC for key artifact pages (6-month suppression)
- Remaining www.cursedtours.com/* artifacts: passing through to 404 naturally — monitor May 2026

---

## 6. KNOWN ISSUES / TODO

### High Priority
- [ ] `/chicago-ghost-tours/` stale crawl (last: Jan 29). Submit for recrawl via GSC.
- [ ] `destinations.ts` has duplicate `heroImage` key for Dracula's Castle — harmless but worth fixing
- [ ] No `/tours/` hub page exists in Astro build — was p2.1 in WP, should be rebuilt as city directory

### Medium Priority
- [ ] Add `TouristAttraction` schema with geo coordinates to all city hub pages
- [ ] Chicago hub title needs update: add year + key attractions for CTR improvement
  - Current: "Chicago Ghost Tours: Gangsters, Ghosts & Fire | Cursed Tours"
  - Proposed: "Chicago Ghost Tours 2026: H.H. Holmes, Gangsters & Haunted Cemeteries"
- [ ] Edinburgh hub title update when it starts climbing:
  - Proposed: "Edinburgh Ghost Tours 2026: Underground Vaults, Greyfriars & Burke + Hare"
- [ ] Homepage not found via sitemap (sitemap=[] in GSC) — check sitemap.xml.ts includes homepage

### Monitor in May 2026
- [ ] wp.cursedtours.com cleanup complete? → delete Netlify site + DNS if yes
- [ ] URL removal requests expiring (~6 months from submission) — verify pages still 404

---

## 7. CONTENT INVENTORY

### Articles: 160+ JSON files in src/data/articles/
Organized by city/topic clusters. Key clusters:
- **Salem**: witch trials deep-dives (12 articles)
- **Chicago**: gangsters, fires, ghosts (10 articles)
- **New Orleans**: voodoo, French Quarter, LaLaurie (8 articles)
- **Edinburgh**: Burke & Hare, vaults, Greyfriars (5 articles)
- **Each city hub**: ~8 articles average

### High-GSC-impression old WP slugs with NO article equivalent (content gaps)
These ranked well in WP but content was not migrated — potential new article targets:
- `/why-do-people-see-spirits-in-cemeteries/` (11 impr, pos 13.7)
- `/real-cemetery-encounters-true-witness-accounts/` (9 impr, pos 14.7)
- `/top-abandoned-asylum-ghost-tour-destinations/` (8 impr, pos 11.6)
- `/7-best-victorian-haunted-house-investigations-uncovered/` (7 impr, pos 10.1)
- `/famous-ghost-sightings-in-haunted-castles-and-estates/` (6 impr, pos 5.3)
- `/5-famous-historical-ghost-cases-reviewed/` (5 impr, pos 3.8)
- `/haunted-castle-overnight-stay-experiences-10/` (5 impr, pos 10.6)
These are good article candidates — search intent is clear and they previously ranked.

### Article Writer Config
See `docs/ARTICLE-WRITER-CONFIG.md` for full writing rules, JSON schema, banned phrases, QC checklist.

---

## 8. LOCAL DEV ENVIRONMENT

### MCP Servers (D:\dev\mcp-servers\)
| Server | Tool names | Notes |
|---|---|---|
| `gsc-oauth` | `google-search-console` | Python 3.14, fully authed via token.json |
| `cursedtours-mcp` | `cursedtours-wp` | Site-specific WP tools |
| `viator-mcp` | `viator-api` | Viator API |
| Git via uvx | `git` | mcp-server-git |

Config: `C:\Users\genar\AppData\Roaming\Claude\claude_desktop_config.json`
(mcpServers block already merged — restart Claude Desktop to activate)

### GSC Direct Python Access (if MCP not loaded)
```python
import sys
sys.path.insert(0, 'D:/dev/mcp-servers/gsc-oauth')
from gsc import get_search_performance, inspect_url, detect_quick_wins
# site = 'sc-domain:cursedtours.com'
```

### Other GSC Properties (same account)
- `sc-domain:startchalking.com` (siteOwner)
- `sc-domain:jazzdiggs.com` (siteOwner)
- `sc-domain:protrainerprep.com` (siteOwner)
- `https://diggingscriptures.com/` (siteOwner)

---

## 9. DEEP GSC REVIEW COMMANDS

```
"Deep GSC review wp.cursedtours.com"          → full 28d vs prev 28d analysis
"Deep GSC review wp.cursedtours.com US mobile" → device/geo breakdown
"Deep GSC review wp.cursedtours.com /articles/" → section-specific
"GSC losses wp.cursedtours.com last 14 days"   → drops only
```

### Workflow
1. Call GSC MCP → get_performance_data, detect_quick_wins, compare_periods
2. 28d vs prev 28d by query/page/country/device
3. Group by Astro URL patterns
4. GitHub MCP file reads for underperformers
5. Output copy-paste frontmatter/MDX fixes

---

## 10. CHANGELOG

| Date | Action |
|---|---|
| ~Jan 2026 | Astro migration live. 18-day crawl gap Dec 17–Jan 4. |
| Feb 4, 2026 | Peak GSC day: 71 impressions, avg pos 12.6 (Google honeymoon crawl) |
| Feb 18, 2026 | Rankings settled deep — hub pages dropped to pos 70–90 |
| 2026-03-15 | Added robots.txt `Disallow: /` to wp.cursedtours.com |
| 2026-03-15 | Added category → hub 301 redirects to netlify.toml |
| 2026-03-15 | Added Chicago tour page 301s → /chicago-ghost-tours/ |
| 2026-03-15 | Added /affiliate-disclosure/ → /editorial-policy/ redirect |
| 2026-03-15 | Added /cookie-policy/ → /privacy-policy/ redirect |
| 2026-03-15 | Deployed both cursedtours.com and wp.cursedtours.com |
