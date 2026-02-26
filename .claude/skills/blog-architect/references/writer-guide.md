# Writer Guide — Blog Architect

Niche-agnostic content generation for spoke articles and blog posts. Voice, structure, and quality bar are consistent; only subject matter and affiliate context change per site.

## CRITICAL: Character Encoding

All article JSON files MUST be written as UTF-8 with explicit encoding declaration.
Failure to do this causes **mojibake** — garbled characters where UTF-8 multi-byte
sequences get misinterpreted as Windows-1252 (cp1252) code points.

**When writing JSON files, ALWAYS use:**
```python
with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(article, f, ensure_ascii=False, indent=2)
```

**When reading JSON files, ALWAYS use:**
```python
with open(filepath, 'r', encoding='utf-8') as f:
    article = json.load(f)
```

**Never:** rely on system default encoding, omit the `encoding` parameter, or
use `ensure_ascii=True` (which escapes Unicode to `\uXXXX` sequences).

**Verify after every write:** scan for mojibake patterns like `â€"` (should be `—`),
`â€™` (should be `'`), `Ã©` (should be `é`). If any are found, the file was
written with wrong encoding and must be regenerated.

## Voice & Tone (Universal)

**Authoritative but not academic.** Subject-matter expert who is also a great storyteller. Specific dates, names, data points, sourced facts — in flowing narrative prose, not footnoted essays.

**Serious but proportionate.** Match tone to subject gravity. Dark history gets respect. Fitness gets direct guidance. Food gets sensory language. Never sensationalize.

**Skeptical but fair.** Present claims as reported testimony: "reports describe," "users report," "studies suggest." No endorsing or dismissing.

**Direct prose, no filler.** Every paragraph earns its place. No "In this article, we'll explore..." No preambles. Drop the reader in from sentence one.

## Spoke Article Structure (HTML)

```html
<p>Opening — hook with the most compelling fact or scene.</p>

<p>Context — link to parent hub:
<a href="/{hub-slug}/">{Hub Page Title}</a>.</p>

<h2>Section Heading</h2>
<p>Body paragraphs. 3-5 per section. Specific facts.</p>

<h2>Another Section</h2>
<p>Continue...</p>

<hr />
<h3>Continue Reading</h3>
<ul>
  <li><a href="/articles/related-slug/">Related Spoke Title</a></li>
  <li><a href="/{hub-slug}/">{Hub Page} — Complete Guide</a></li>
</ul>
```

**Rules:** No `<h1>`. No inline images. 4-7 H2s per article.

## Spoke Linking Rules

1. Link to parent hub in first 2-3 paragraphs
2. 2-4 links to sibling spokes naturally in body text
3. "Continue Reading" at end with 3-5 links (spokes + hub)
4. Link to destination pages when a specific location is mentioned (travel sites only)

## Blog Post Structure (HTML)

```html
<p>Opening — hook with broad niche angle, not hub-specific.</p>

<p>Context — reference multiple hubs naturally:
<a href="/austin-ghost-tours/">Austin</a>,
<a href="/boston-ghost-tours/">Boston</a>, and
<a href="/salem-ghost-tours/">Salem</a> all feature...</p>

<h2>Section Heading</h2>
<p>Body. Link to specific spoke articles across hubs when relevant.</p>

<hr />
<h3>Continue Reading</h3>
<ul>
  <li><a href="/blog/another-post/">Related Blog Post Title</a></li>
  <li><a href="/austin-ghost-tours/">Austin — Complete Guide</a></li>
  <li><a href="/blog/">All Guides & Resources</a></li>
</ul>
```

## Blog Post Linking Rules

1. Link to 2-4 hub pages wherever contextually relevant (not just opening)
2. Link to spoke articles across different hubs — this is the bridge function
3. "Continue Reading" at end: blog pillar + 2-3 blog posts + 1-2 hub pages
4. Link back to blog pillar via breadcrumb or "More Guides"
5. No single parent hub — children of blog pillar, not any hub

## SEO Patterns (Updated for Semantic Search Era)

- **Title**: ≤60 chars preferred. Primary keyword is a signal, not a hard requirement —
  semantic search understands "Salem Witch Trial Legacy" covers "salem witch trials."
  Google rewrites ~76% of title tags, so optimize for clarity and click appeal over exact keyword placement.
- **H2s**: Each readable as a search query. Aim for 4-8, but content quality trumps heading count.
  Semantic search rewards topical breadth (I6 score) over rigid heading counts.
- **Excerpt**: ≤155 chars preferred. Google rewrites 60-70% of meta descriptions, so write for
  human click-through, not character counting.
- **First paragraph**: Answer the search intent directly. The primary keyword should appear
  naturally but does not need to be forced into the first 100 words.
- **Word count**: 1,000-2,000 standard; 2,000-3,500 comprehensive
- **What matters most**: Entity density (named people, places, dates, data points),
  topical authority (deep factual coverage), E-E-A-T signals (source citations,
  experiential detail), and internal linking structure (hub-spoke architecture).

## Post-Write Validation (MANDATORY)

After writing any article JSON file, **immediately run the validator**:

```bash
python scripts/validate_article.py {slug}
```

This checks all BLOCK-tier rules (encoding, mojibake, banned phrases, broken links,
featured image, word count, etc.). Exit code 0 = safe to deploy. Exit code 1 = fix required.

**To auto-fix mojibake:**
```bash
python scripts/validate_article.py {slug} --fix
```

**To validate the entire corpus:**
```bash
python scripts/validate_article.py --all
```

**To validate recently modified articles (e.g. after a batch generation):**
```bash
python scripts/validate_article.py --recent 10
```

Never skip this step. The validator catches encoding bugs, mojibake, banned phrases,
and structural errors that are invisible to the writer but break the production site.

For full optimization (metadata, sibling links, semantic scores), run SemanticPipe after validation:
```bash
python semanticpipe.py --slugs {slug}
```
