# CursedTours — Article Writer Config
# Version: 1.0 | Created: 2026-02-24
#
# USAGE: This is the writer config for cursedtours.com.
# The Content Writer skill loads this file when generating articles for this site.
# It can also be used standalone: paste as context and request "Write the article for [slug]"

---

# 1. SITE IDENTITY

**Site:** cursedtours.com
**Voice:** Knowledgeable guide — atmospheric but factual, never sensational
**Audience:** History and true-crime enthusiasts, ghost tour travelers, dark tourism curious
**Revenue model:** Viator/GetYourGuide affiliate tours, display ads
**Content directory:** `src/data/articles/`
**File format:** JSON (see Section 3 for schema)
**URL pattern:** `/articles/{slug}/`

---

# 2. CONTENT ARCHITECTURE

## Blog Hubs (category index pages)
```
/blog/salem-witch-trials/
/blog/vampire-culture/
/blog/tower-of-london/
/blog/prison-history/
/blog/gettysburg/
/blog/pop-culture/
/blog/american-prison-history/
```

## City Hubs (tour-focused)
```
/new-orleans/
/savannah/
/salem/
/new-york/
```

## Articles
Individual deep-dive articles organized under blog categories.
Every article belongs to exactly one category and links back to its hub.

---

# 3. ARTICLE JSON SCHEMA

Every article is a single JSON file in `src/data/articles/{slug}.json`.

```json
{
  "title": "Article Title: Subtitle (≤60 chars for SEO)",
  "slug": "kebab-case-slug-matching-filename",
  "id": 0,
  "status": "publish",
  "post_type": "article",
  "uri": "/articles/{slug}/",
  "date": "YYYY-MM-DD HH:MM:SS",
  "modified": "YYYY-MM-DD HH:MM:SS",
  "content": "<h2>...</h2>\n<p>...</p>\n...",
  "excerpt": "≤155 chars. Direct answer to search intent.",
  "categories": [
    {
      "id": 0,
      "slug": "category-slug",
      "name": "Category Name",
      "description": "One-line category description"
    }
  ],
  "pageType": "hub-spoke",
  "featuredImage": {
    "sourceUrl": "/images/articles/{slug}.webp",
    "altText": "Descriptive alt text matching title",
    "width": 800,
    "height": 450
  },
  "wordCount": 0,
  "readingTime": "X min read",
  "articleType": "spoke"
}
```

### Content field format
The `content` field is an HTML string. Use only these elements:
- `<h2>` — main sections (4-8 per article)
- `<h3>` — subsections within an H2 (optional, 0-3 per section)
- `<p>` — body paragraphs
- `<a href="/articles/...">` — internal links (relative paths only)
- `<ul>` / `<ol>` / `<li>` — lists (sparingly)
- `<blockquote>` — historical quotes (attributed, with source)
- `<em>` / `<strong>` — emphasis (sparingly)
- `<hr />` — section divider before "Continue Reading" footer

### Continue Reading footer (REQUIRED)
Every article must end with:
```html
<hr /><h3>Continue Reading</h3>
<ul><li><a href="/blog/{category-slug}/">Explore the {Category Name} Hub</a></li>
<li><a href="/articles/{sibling-1}/">{Sibling 1 Title}</a></li>
<li><a href="/articles/{sibling-2}/">{Sibling 2 Title}</a></li></ul>
```

### Calculated fields
Set these based on the content:
- `wordCount`: Count words in content field (strip HTML tags first)
- `readingTime`: `Math.ceil(wordCount / 275)` + " min read"

---

# 4. WRITING RULES

## Voice and tone
- **Authoritative but not academic.** Write like a deeply knowledgeable tour guide
  who reads primary sources for fun. You know the facts cold, but you tell them
  like stories, not lectures.
- **Atmospheric but grounded.** Set scenes with sensory detail — what the place looks
  like, what you'd hear, what the air feels like. But anchor every atmospheric
  passage in verifiable fact.
- **Never sensational.** No clickbait language. No "you won't believe." Let the
  history be dramatic on its own — it usually is.
- **First person sparingly.** Use "I visited" or "I walked through" for experiential
  authority, but the article is about the subject, not the writer.
- **Address the reader as "you."** "When you stand in the cell..." not "When one stands..."

## Data density requirements
- ≥5 specific data points per article (dates, dollar amounts, measurements, counts)
- ≥3 named people (historical figures, researchers, officials — not fictional)
- ≥2 named places or institutions beyond the main subject
- At least 1 primary source reference (book, archive, court record, newspaper)

## Banned phrases (NEVER use)
- journey, unlock, game-changer, dive in, explore the depths
- delve, realm, furthermore, in conclusion, nestled
- it's important to note, in today's world, it should be noted
- needless to say, as we all know, without further ado
- spine-tingling, bone-chilling, hair-raising (let readers feel it, don't tell them to)
- reportedly haunted (either cite the specific claim or don't mention it)

## SEO requirements
- Title: ≤60 characters, primary keyword first or early
- Excerpt: ≤155 characters, answers the search intent directly
- H2 headings: Use keyword-relevant phrases, not clever puns
- First 100 words: Must contain primary keyword naturally
- First paragraph: Answer the core question. No throat-clearing.

---

# 5. ARTICLE STRUCTURE

## Standard article (1,000-2,500 words, 4-6 H2s)

```
<h2>[Direct answer to search intent]</h2>
<p>First 100 words answer the query. Open with a specific fact, date, or scene.
No "In this article we'll explore..." No preamble. 150-300 words.</p>

<h2>[Core historical narrative or analysis]</h2>
<p>The deepest section. Primary sources, specific dates, named people, cause
and effect. This is where the article earns its authority. 300-500 words.</p>

<h2>[Secondary angle — the human story, the aftermath, or the controversy]</h2>
<p>A different lens on the same subject. What happened to the people involved?
What do historians disagree about? What does the place look like today?
200-400 words. Link to 1-2 sibling articles here.</p>

<h2>[Practical/visitor angle — if applicable]</h2>
<p>What can you see today? Tour recommendations. What to know before visiting.
200-300 words. This section earns affiliate revenue naturally by being useful.</p>

<h2>[Legacy or "why it matters" closing]</h2>
<p>Connect the historical subject to something larger — a pattern, a modern
parallel, or the reason people are still fascinated. 100-200 words.
Link to parent hub here.</p>

<hr /><h3>Continue Reading</h3>
<ul>...</ul>
```

---

# 6. INTERNAL LINKING RULES

- **Minimum 3 internal links** in body content (not counting Continue Reading footer)
- **Maximum 8** — beyond that it feels forced
- **MUST link to parent hub** at least once in body text
- **MUST link to 2+ siblings** in the same category
- **Anchor text:** 3-6 word descriptive phrases within natural sentences
  - ✅ "the <a href='...'>complete history of Alcatraz</a>"
  - ❌ "<a href='...'>click here</a>"
  - ❌ "<a href='...'>read more</a>"
- **No self-links.** Never link to the article's own URL.
- **First-link-wins.** If you mention a sibling topic multiple times, only link the first mention.

---

# 7. QC CHECKLIST

Before outputting any article, verify ALL of these:

### JSON validity
- [ ] Valid JSON — no trailing commas, proper escaping in content field
- [ ] All required fields present
- [ ] slug matches filename (without .json extension)
- [ ] uri matches /articles/{slug}/
- [ ] date and modified in correct format

### SEO
- [ ] title ≤60 characters
- [ ] excerpt ≤155 characters
- [ ] First 100 words contain primary keyword
- [ ] 4-6 H2 headings with keyword-relevant text

### Content quality
- [ ] Word count 1,000-2,500 (standard) or 2,000-4,000 (pillar)
- [ ] ≥5 data points (dates, numbers, measurements)
- [ ] ≥3 named people
- [ ] ≥1 primary source reference
- [ ] Zero banned phrases
- [ ] First paragraph answers search intent directly

### Linking
- [ ] ≥3 internal links in body (not counting Continue Reading)
- [ ] Links to parent hub present
- [ ] ≥2 sibling links present
- [ ] Continue Reading footer with hub + 2 siblings
- [ ] All link hrefs use relative paths starting with /
- [ ] All linked pages actually exist (check against sitemap or article list)

### Image
- [ ] featuredImage.sourceUrl follows /images/articles/{slug}.webp pattern
- [ ] altText is descriptive (not just the title repeated)

---

# 8. CONTENT BRIEF INPUT FORMAT

When receiving a content brief from the Semantic SEO strategist:

```json
{
  "type": "content-brief",
  "site": "cursedtours",
  "slug": "target-slug",
  "targetCategory": "blog/category-slug",
  "primaryKeyword": "primary search keyword",
  "secondaryKeywords": ["keyword 2", "keyword 3"],
  "requiredSubtopics": ["subtopic 1", "subtopic 2"],
  "requiredEntities": ["Person Name", "Place Name", "Event Name"],
  "internalLinks": {
    "parentHub": "/blog/category-slug/",
    "siblings": ["/articles/sibling-1/", "/articles/sibling-2/"],
    "bridges": ["/articles/cross-category-link/"]
  },
  "wordCountTarget": "1500-2500"
}
```

**The writer MUST:**
1. Cover every item in requiredSubtopics (each gets at least a paragraph)
2. Mention every entity in requiredEntities naturally in context
3. Include every link in internalLinks at least once
4. Hit the wordCountTarget range
5. Still follow all voice, structure, and QC rules above

---

END OF WRITER CONFIG
