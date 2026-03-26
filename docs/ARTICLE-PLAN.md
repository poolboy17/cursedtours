# Article Cluster Plan — 15 Cities × 10 Articles

## Current State
- 4 clusters complete: Salem (13), New Orleans (11), Chicago (10), Dracula (11)
- 16 tour-planning articles
- **61 total articles, all passing 30-check audit**
- 15 city hubs have zero supporting articles

## The Work: 150 Articles

### Batch Order (GSC signals + market size)

| Batch | City | Category Slug | Hub Page | Topic Angles |
|-------|------|---------------|----------|--------------|
| 1 | Savannah | savannah-haunted-history | /savannah-ghost-tours/ | Bonaventure Cemetery, Mercer-Williams House, colonial hauntings, burial grounds, yellow fever |
| 2 | Charleston | charleston-haunted-history | /charleston-ghost-tours/ | Old Jail, Unitarian Cemetery, Civil War ghosts, Lowcountry hoodoo, pirates |
| 3 | Boston | boston-haunted-history | /boston-ghost-tours/ | Boston Strangler, Salem connection, colonial hauntings, USS Constitution, Boston Massacre |
| 4 | Edinburgh | edinburgh-haunted-history | /edinburgh-ghost-tours/ | Edinburgh Vaults, Burke & Hare, Mary King's Close, Greyfriars, Scottish witch trials |
| 5 | London | london-haunted-history | /london-ghost-tours/ | Jack the Ripper, Tower of London, plague pits, Highgate Cemetery, Hampton Court |
| 6 | New York | new-york-haunted-history | /new-york-ghost-tours/ | Five Points, Greenwich Village, Merchant's House, Gilded Age murders, subway ghosts |
| 7 | St. Augustine | st-augustine-haunted-history | /st-augustine-ghost-tours/ | Castillo de San Marcos, Flagler College, Spanish colonial ghosts, oldest city, Lighthouse |
| 8 | San Antonio | san-antonio-haunted-history | /san-antonio-ghost-tours/ | Alamo ghosts, Spanish missions, Railroad tracks legend, Menger Hotel, Emily Morgan |
| 9 | Rome | rome-haunted-history | /rome-ghost-tours/ | Capuchin Crypt, Colosseum, catacombs, Nero, Castel Sant'Angelo |
| 10 | Paris | paris-haunted-history | /paris-ghost-tours/ | Catacombs, Père Lachaise, Phantom of the Opera, French Revolution, Conciergerie |
| 11 | Dublin | dublin-haunted-history | /dublin-ghost-tours/ | Kilmainham Gaol, Hellfire Club, Viking Dublin, Bram Stoker, Glasnevin Cemetery |
| 12 | Washington DC | washington-dc-haunted-history | /washington-dc-ghost-tours/ | White House ghosts, Capitol hauntings, Georgetown, Octagon House, Lincoln's ghost |
| 13 | Nashville | nashville-haunted-history | /nashville-ghost-tours/ | Ryman Auditorium, Printers Alley, Two Rivers Mansion, Bell Witch, Capitol ghosts |
| 14 | Austin | austin-haunted-history | /austin-ghost-tours/ | Driskill Hotel, Littlefield House, Moonlight Towers, Servant Girl Annihilator, Sixth Street |
| 15 | Denver | denver-haunted-history | /denver-ghost-tours/ | Brown Palace, Cheesman Park, Molly Brown House, Lumber Baron Inn, Capitol Hill |

### Per-City Workflow (repeat 15 times)

```
1. Register category in article_utils.py (CATEGORY_HUBS) + articles.ts (CATEGORIES)
2. Research 10 article topics (1 pillar + 9 cluster)
3. Generate articles via TextBuilder or manual drafting
4. Run through pipeline: publish_articles(articles, hub_url="/{city}-ghost-tours/")
5. Pipeline auto-enforces: SEO, linking, Continue Reading, hub links, breadcrumbs
6. Commit + push → auto-deploy
7. Verify build + audit
```

### Article Pattern Per City (10 articles)

| # | Type | Pattern | ~Words |
|---|------|---------|--------|
| 1 | Pillar | "Most Haunted Places in {City}" or "{City} Haunted History" | 1,200-1,500 |
| 2 | Cluster | Signature landmark #1 (the iconic location) | 800-1,200 |
| 3 | Cluster | Signature landmark #2 | 800-1,200 |
| 4 | Cluster | Historical event/tragedy that left ghosts | 800-1,200 |
| 5 | Cluster | Famous ghost or haunting | 800-1,200 |
| 6 | Cluster | Cemetery or burial ground | 800-1,200 |
| 7 | Cluster | Hotel/inn/bar with hauntings | 800-1,200 |
| 8 | Cluster | Historical deep-dive (war, fire, epidemic) | 800-1,200 |
| 9 | Cluster | "What to Expect on a {City} Ghost Tour" | 800-1,200 |
| 10 | Cluster | Cultural/folklore angle unique to that city | 800-1,200 |

### Pre-Work: Register All 15 Categories (one-time)

Add all category slugs to both `article_utils.py` and `src/data/articles.ts` before any batches start. This way any batch can run without blocking on missing categories.

### Totals When Complete

| Metric | Now | After |
|--------|-----|-------|
| Articles | 61 | 211 |
| City clusters | 3 | 18 |
| Total words | ~70k | ~220k+ |
| Sitemap URLs | 105 | 255 |
