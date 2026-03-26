# SemanticPipe Unified Spec — CursedTours
# Version: 2.1 | Created: 2026-02-25 | Updated: 2026-02-26
#
# This is the SINGLE SOURCE OF TRUTH for writing, optimizing,
# and auditing articles on cursedtours.com.
#
# The optimizer reads this spec before every run.
# The optimizer validates its own output against this spec.
# The optimizer logs every action to AUDIT-LOG.md.
# An external audit script can verify results independently.

---

# 1. SITE IDENTITY

Site: cursedtours.com
Voice: Knowledgeable guide — atmospheric but factual, never sensational
Audience: History/true-crime enthusiasts, ghost tour travelers, dark tourism curious
Revenue: Viator/GetYourGuide affiliate tours, display ads
Content dir: src/data/articles/
File format: JSON (see Section 4)
URL pattern: /articles/{slug}/

---

# 2. VALIDATION TIERS

Every check in this spec belongs to one of three tiers.
The optimizer MUST self-validate before writing to disk.

## BLOCK — Must pass. Article cannot be saved if these fail.
These break the site or actively harm SEO.

| ID  | Check | Threshold |
|-----|-------|-----------|
| B1  | Valid JSON | Parses without error |
| B4  | No H1 in body | 0 h1 tags in content |
| B6  | Word count floor | ≥1,000 |
| B7  | No banned phrases | 0 matches in body (see Section 6) |
| B8  | No mojibake | 0 encoding artifacts (UTF-8 → cp1252) |
| B10 | No self-links | Article does not link to its own URL |
| B11 | No broken internal links | Every /articles/X/ href resolves |
| B14 | Featured image present | sourceUrl and altText non-empty |

## WARN — Should pass. Log the failure, fix later.
These are SEO best practices worth tracking but don't prevent saving.

| ID  | Check | Threshold | Notes |
|-----|-------|-----------|-------|
| B2  | Title length | ≤60 characters | Google rewrites ~76% of titles |
| B3  | Excerpt length | ≤155 characters | Google rewrites 60-70% of descriptions |
| B5  | H2 heading count | 4-8 (standard), 4-16 (≥2000w) | Editorial preference, not SEO gate |
| B9  | ≥3 internal body links | Before hr, not counting footer | Helpful but 2 links ≠ broken |
| B12 | Primary keyword in title | Target keyword or close variant | Semantic search ≠ exact match |
| B13 | Primary keyword in first 100 words | Present naturally | Topic coverage > keyword placement |
| W1  | wordCount field present | >0 | |
| W2  | readingTime field present | Non-empty | |
| W3  | articleType field present | spoke/pillar | |
| W4  | pageType field set | Not "unassigned" | |
| W5  | Continue Reading footer | hr + Continue Reading + hub + siblings | |
| W6  | Hub link in body | ≥1 link to parent hub page | |
| W7  | ≥2 sibling links | Links to other articles in same category | |

## INFO — Track only. Measured at write time, stored in JSON.
These are semantic depth signals. Useful for spotting thin content
but not actionable as pass/fail in an audit.

| ID  | Signal | Stored field | Threshold (at write time) |
|-----|--------|-------------|--------------------------|
| I1  | Named entities | semanticScores.entities | ≥5 per article |
| I2  | Unique years cited | semanticScores.years | ≥3 per article |
| I3  | Data points | semanticScores.dataPoints | ≥5 per article |
| I4  | Named people | semanticScores.namedPeople | ≥3 per article |
| I5  | Source/authority refs | semanticScores.sourceRefs | ≥1 per article |
| I6  | H2 topic breadth | semanticScores.h2Breadth | ≥8 unique terms |
| I7  | Entity density | semanticScores.entityDensity | ≥3.0 per 1k words |

These scores are written INTO the article JSON at creation/optimization
time. The audit script checks for field presence and minimums — it does
NOT re-derive the values from HTML. The optimizer is the authority.

---

# 3. WRITING RULES

## Voice and tone
- Authoritative but not academic. Write like a deeply knowledgeable tour
  guide who reads primary sources for fun.
- Atmospheric but grounded. Set scenes with sensory detail but anchor
  every atmospheric passage in verifiable fact.
- Never sensational. No clickbait language. Let the history be dramatic
  on its own.
- First person sparingly. "I visited" for experiential authority, but
  the article is about the subject, not the writer.
- Address the reader as "you."

## Data density requirements
- ≥5 specific data points per article (dates, amounts, measurements, counts)
- ≥3 named people (historical figures, researchers, officials — not fictional)
- ≥2 named places or institutions beyond the main subject
- ≥1 primary source reference (book, archive, court record, newspaper)

## Banned phrases (NEVER use) [B7]
journey, unlock, game-changer, dive in, explore the depths,
delve, realm, furthermore, in conclusion, nestled,
it's important to note, in today's world, it should be noted,
needless to say, as we all know, without further ado,
spine-tingling, bone-chilling, hair-raising, reportedly haunted

## SEO requirements
- Title ≤60 chars, primary keyword first or early [B2, B12]
- Excerpt ≤155 chars, answers search intent directly [B3]
- H2 headings: keyword-relevant phrases, not puns [B5]
- First 100 words must contain primary keyword naturally [B13]
- First paragraph: answer the core question, no throat-clearing

---

# 4. ARTICLE JSON SCHEMA

Every article is a single JSON file: src/data/articles/{slug}.json

```json
{
  "title": "≤60 chars, primary keyword early",
  "slug": "kebab-case-matching-filename",
  "id": 0,
  "status": "publish",
  "post_type": "article",
  "uri": "/articles/{slug}/",
  "date": "YYYY-MM-DD HH:MM:SS",
  "modified": "YYYY-MM-DD HH:MM:SS",
  "content": "<h2>...</h2>\n<p>...</p>...",
  "excerpt": "≤155 chars. Direct answer to search intent.",
  "categories": [{
    "id": 0,
    "slug": "category-slug",
    "name": "Category Name",
    "description": "One-line description"
  }],
  "pageType": "hub-spoke",
  "featuredImage": {
    "sourceUrl": "/images/articles/{slug}.webp",
    "altText": "Descriptive alt text",
    "width": 800,
    "height": 450
  },
  "wordCount": 1234,
  "readingTime": "5 min read",
  "articleType": "spoke",
  "semanticScores": {
    "entities": 37,
    "years": 10,
    "dataPoints": 25,
    "namedPeople": 5,
    "sourceRefs": 9,
    "h2Breadth": 27,
    "entityDensity": 22.0
  }
}
```

### Content field format
The content field is an HTML string. Allowed elements only:
- <h2> — main sections (4-8 per article) [B5]
- <h3> — subsections within an H2 (optional, 0-3 per section)
- <p> — body paragraphs
- <a href="/articles/..."> — internal links (relative paths only) [B9]
- <ul> / <ol> / <li> — lists (sparingly)
- <blockquote> — historical quotes (attributed, with source)
- <em> / <strong> — emphasis (sparingly)
- <hr /> — section divider before Continue Reading footer

### Continue Reading footer (REQUIRED) [W5]
Every article must end with:
```html
<hr /><h3>Continue Reading</h3>
<ul>
<li><a href="/blog/{category-slug}/">Explore the {Category Name} Hub</a></li>
<li><a href="/articles/{sibling-1}/">{Sibling 1 Title}</a></li>
<li><a href="/articles/{sibling-2}/">{Sibling 2 Title}</a></li>
</ul>
```

### Calculated fields (set by optimizer before saving)
- wordCount: count words in content (strip HTML first) [W1]
- readingTime: Math.ceil(wordCount / 275) + " min read" [W2]
- semanticScores: all I1-I7 values (see Section 2) [INFO tier]

---

# 5. INTERNAL LINKING RULES

- Minimum 3 internal links in body content (before hr) [B9]
- Maximum 8 — beyond that it feels forced [W10]
- MUST link to parent hub at least once in body [W6]
- MUST link to ≥2 siblings in same category [W7]
- Anchor text: 3-6 word descriptive phrases in natural sentences [W8]
  ✅ "the <a href='...'>complete history of Alcatraz</a>"
  ❌ "<a href='...'>click here</a>"
- No self-links [B10]
- First-link-wins: same target linked only once in body [W9]

---

# 6. ARTICLE STRUCTURE TEMPLATE

## Standard article (1,000-2,500 words, 4-6 H2s)

```
<h2>[Direct answer to search intent]</h2>
First 100 words answer the query. Open with a specific fact, date,
or scene. No "In this article we'll explore..." 150-300 words.

<h2>[Core historical narrative or analysis]</h2>
The deepest section. Primary sources, specific dates, named people,
cause and effect. 300-500 words.

<h2>[Secondary angle — human story, aftermath, or controversy]</h2>
Different lens on the same subject. What happened to the people?
What do historians disagree about? 200-400 words.
Link to 1-2 sibling articles here.

<h2>[Practical/visitor angle — if applicable]</h2>
What can you see today? Tour recommendations. 200-300 words.
This section earns affiliate revenue by being useful.

<h2>[Legacy or "why it matters" closing]</h2>
Connect the subject to something larger. 100-200 words.
Link to parent hub here.

<hr /><h3>Continue Reading</h3>
<ul>...</ul>
```

## Pillar article (2,000-4,000 words, 6-8 H2s)
Same structure but deeper. More sections, more sources, more entities.
Pillar articles anchor a category cluster.

---

# 7. OPTIMIZER RUNTIME PROCESS

When optimizing an article, the optimizer MUST follow this sequence:

### Step 1: Load context
- Read this spec (SEMANTICPIPE-UNIFIED-SPEC.md)
- Read the article JSON from disk
- Know the full article inventory (for cross-link validation)
- Know the article's category and siblings

### Step 2: Optimize
- Apply all writing rules (Section 3)
- Fix any BLOCK-tier failures
- Fix any WARN-tier issues where possible
- Preserve the article's existing voice and factual content
- Do NOT rewrite content that already meets the spec
- DO fix: title length, excerpt length, banned phrases, internal
  links, footer, metadata fields, mojibake

### Step 3: Self-validate
Before saving, check the output against ALL Block-tier rules.
Record the result of every check.

### Step 4: Compute semantic scores
Count entities, years, data points, named people, source refs,
h2 breadth, entity density. Write these into the semanticScores
field in the JSON. These are now facts — not re-derived later.

### Step 5: Compute metadata
- Strip HTML from content, count words → wordCount
- Math.ceil(wordCount / 275) → readingTime
- Set modified to current timestamp
- Set articleType if missing (spoke/pillar/long-form)
- Set pageType if missing (hub-spoke for clustered articles)

### Step 6: Save
Write the JSON to disk.

### Step 7: Log
Append to AUDIT-LOG.md with this format:

```
## [YYYY-MM-DD HH:MM] — Optimization Run
**Operator:** Cowork
**Article:** {slug}
**Spec version:** SEMANTICPIPE-UNIFIED-SPEC.md v2.0

### Validation Results
| Tier | ID | Check | Result |
|------|----|-------|--------|
| BLOCK | B1 | Valid JSON | PASS |
| BLOCK | B2 | Title ≤60 | PASS (54 chars) |
...
| WARN | W1 | wordCount present | PASS (1,423) |
...
| INFO | I1 | Named entities | 37 (stored) |
...

### Changes Made
- Title: trimmed from 67 to 58 chars
- Excerpt: rewritten from 162 to 148 chars
- Added 3 internal body links (was 1)
- Added Continue Reading footer
- Removed banned phrase "journey" from paragraph 4
- Computed semanticScores and stored in JSON

### Block fails remaining: 0
### Warn fails remaining: 1 (W12 — category unconfirmed)
```

This log entry is MANDATORY. Every optimization produces a log.
No exceptions. The log is the proof of work.

---

# 8. EXTERNAL AUDIT (periodic, independent)

The audit script (audit.py) runs independently of the optimizer.
It checks all articles on disk against the Block and Warn tiers.
It verifies that semanticScores fields are present and above minimums.
It does NOT re-derive semantic scores from HTML.

The audit produces AUDIT-REPORT.md with per-article results.
Run it after optimization batches and periodically to catch drift.

---

# 9. CATEGORY HUBS AND ARTICLE INVENTORY

The optimizer must know valid link targets. Hub pages:

```
/blog/salem-witch-trials/
/blog/vampire-culture/
/blog/tower-of-london-history/
/blog/american-prison-history/
/blog/gettysburg-civil-war/
/blog/pop-culture-dark-history/
/blog/chicago-haunted-history/
/blog/new-orleans-voodoo-haunted-history/
/blog/key-west-haunted-history/
/blog/austin-haunted-history/
/blog/boston-haunted-history/
/blog/charleston-haunted-history/
/blog/denver-haunted-history/
/blog/dublin-haunted-history/
/blog/edinburgh-haunted-history/
/blog/london-haunted-history/
/blog/nashville-haunted-history/
/blog/new-york-haunted-history/
/blog/paris-haunted-history/
/blog/rome-haunted-history/
/blog/san-antonio-haunted-history/
/blog/savannah-haunted-history/
/blog/st-augustine-haunted-history/
/blog/washington-dc-haunted-history/
```

Article inventory: 171 articles across 24 categories.
Full list available via: python list_slugs.py
The optimizer must validate all internal links against this inventory.

---

# 10. VERSIONING

- This spec: SEMANTICPIPE-UNIFIED-SPEC.md v2.0
- Replaces: SEO-OPTIMIZATION-SPEC.md v1.0 + ARTICLE-WRITER-CONFIG.md v1.0
- Audit script: audit.py v1.1 (needs update to match v2.0 tiers)
- Audit report: AUDIT-REPORT.md (generated, timestamped)
- Audit log: AUDIT-LOG.md (append-only, every run)

---

END OF UNIFIED SPEC
