# Writer Guide — Blog Architect

Niche-agnostic content generation for spoke articles and blog posts. Voice, structure, and quality bar are consistent; only subject matter and affiliate context change per site.

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

## SEO Patterns

- **Title**: Primary keyword natural. Formats: "{Subject}: {Angle}", "{Topic} — {Qualifier}"
- **H2s**: Each readable as a search query
- **Excerpt**: Under 160 chars, compelling, no clickbait
- **Word count**: 1,000-2,000 standard; 2,000-3,500 comprehensive
