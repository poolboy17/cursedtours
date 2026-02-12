#!/usr/bin/env python3
"""
Article generation pipeline for CursedTours.com.

Four-stage pipeline:

  1. QC LAYER       — Identifies all SEO + linking violations
  2. EDITORIAL LAYER — Auto-fixes titles, excerpts, slugs, internal links
  3. FINAL QC        — Verifies everything passes
  4. WRITE LAYER     — Writes files only after clean QC

Usage:

    from article_utils import Article, publish_articles

    articles = [Article(...), Article(...), ...]
    publish_articles(articles, hub_url="/chicago-ghost-tours/")

Internal linking enforcement:
  - Every article must link to hub page in body content
  - Every article must have a Continue Reading section with ≥3 links
  - Continue Reading must include the hub page link
  - Continue Reading must include ≥2 sibling article links
  - Category must be registered (for breadcrumb JSON-LD in template)
"""

import json, os, re, sys
from dataclasses import dataclass

# ─── Constants ───────────────────────────────────────────────────────────────

BRAND_SUFFIX = " | Cursed Tours"
MAX_TITLE_RAW = 50
MAX_RENDERED_TITLE = 65
MIN_TITLE = 10
MAX_EXCERPT = 160
MIN_EXCERPT = 50
MIN_WORD_COUNT = 500
MIN_BODY_INTERNAL_LINKS = 2  # links in body prose (not counting Continue Reading)
MIN_CONTINUE_READING_LINKS = 3
ARTICLE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "data", "articles")

# Hub page mapping — must match CATEGORIES in src/data/articles.ts
CATEGORY_HUBS = {
    'salem-witch-trials': '/salem-ghost-tours/',
    'new-orleans-voodoo-haunted-history': '/new-orleans-ghost-tours/',
    'chicago-haunted-history': '/chicago-ghost-tours/',
    'dracula-gothic-literature': '/destinations/draculas-castle/',
    'tour-planning': None,  # no hub page
}


# ─── Data class ──────────────────────────────────────────────────────────────

@dataclass
class Article:
    title: str
    slug: str
    excerpt: str
    category_slug: str
    category_name: str
    image_url: str
    image_alt: str
    content: str
    category_description: str = ""
    category_id: int = 0
    article_id: int = 0
    date: str = "2026-02-12 12:00:00"


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _split_continue_reading(content):
    """Split content into (body, continue_reading_html).
    Returns (body, cr_section) or (content, None) if no CR section."""
    # Match <hr /> or <hr/> or <hr> followed by <h3>Continue Reading</h3>
    pattern = r'(\s*<hr\s*/?>[\s\n]*<h3>Continue Reading</h3>[\s\n]*<ul>.*?</ul>)\s*$'
    m = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
    if m:
        body = content[:m.start()]
        cr = m.group(1)
        return body, cr
    return content, None


def _extract_cr_links(cr_html):
    """Extract list of (url, text) from Continue Reading section."""
    if not cr_html:
        return []
    return re.findall(r'<a href="([^"]+)">([^<]+)</a>', cr_html)


def _build_continue_reading(links):
    """Build Continue Reading HTML from list of (url, text) tuples."""
    items = "\n".join(f'<li><a href="{url}">{text}</a></li>' for url, text in links)
    return f'\n\n<hr />\n\n<h3>Continue Reading</h3>\n<ul>\n{items}\n</ul>'


def _get_hub_url(art, explicit_hub=None):
    """Get hub URL for an article — explicit parameter wins, then category lookup."""
    if explicit_hub:
        return explicit_hub
    return CATEGORY_HUBS.get(art.category_slug)


# ─── Stage 1: QC Layer ──────────────────────────────────────────────────────

def _qc_one(art, hub_url=None, sibling_slugs=None):
    """Run QC checks. Returns (fixable, blocking) issue lists."""
    fixable = []
    blocking = []
    hub = _get_hub_url(art, hub_url)
    siblings = sibling_slugs or []

    # ── Title ──
    rendered = f"{art.title}{BRAND_SUFFIX}"
    if len(art.title) < MIN_TITLE:
        blocking.append(f"title too short ({len(art.title)} chars, min {MIN_TITLE})")
    elif len(rendered) > MAX_RENDERED_TITLE:
        fixable.append(f"title too long: {len(art.title)} raw → {len(rendered)} rendered (max {MAX_RENDERED_TITLE})")

    # ── Excerpt ──
    if len(art.excerpt) < MIN_EXCERPT:
        blocking.append(f"excerpt too short ({len(art.excerpt)} chars, min {MIN_EXCERPT})")
    elif len(art.excerpt) > MAX_EXCERPT:
        fixable.append(f"excerpt too long: {len(art.excerpt)} chars (max {MAX_EXCERPT})")

    # ── Slug ──
    if art.slug != art.slug.lower() or re.search(r'[^a-z0-9A-Z\-]', art.slug) or art.slug.endswith('/'):
        fixable.append(f"slug needs cleanup: \"{art.slug}\"")

    # ── Content depth ──
    text_only = re.sub(r'<[^>]+>', ' ', art.content)
    wc = len(text_only.split())
    if wc < MIN_WORD_COUNT:
        blocking.append(f"content too thin ({wc} words, min {MIN_WORD_COUNT})")

    # ── Required fields ──
    if not art.image_url:
        blocking.append("missing featured image URL")
    if not art.image_alt:
        blocking.append("missing featured image alt text")
    if not art.category_slug:
        blocking.append("missing category slug")
    if not art.category_name:
        blocking.append("missing category name")

    # ── Breadcrumb readiness ──
    if art.category_slug and art.category_slug not in CATEGORY_HUBS:
        blocking.append(f"category '{art.category_slug}' not in CATEGORY_HUBS — breadcrumbs will break")

    # ── Internal linking: body content ──
    body, cr = _split_continue_reading(art.content)
    body_links = re.findall(r'href="(/[^"]*)"', body)
    if len(body_links) < MIN_BODY_INTERNAL_LINKS:
        fixable.append(f"body has {len(body_links)} internal link(s) (min {MIN_BODY_INTERNAL_LINKS})")

    # ── Hub link ──
    if hub:
        all_content_links = re.findall(r'href="(/[^"]*)"', art.content)
        has_hub = any(hub.rstrip('/') in link for link in all_content_links)
        if not has_hub:
            fixable.append(f"missing hub link ({hub}) — editorial will inject into Continue Reading")

    # ── Continue Reading section ──
    if not cr:
        fixable.append("no Continue Reading section — editorial will generate one")
    else:
        cr_links = _extract_cr_links(cr)
        # Adjust minimums based on what's actually available
        available_count = (1 if hub else 0) + len([s for s in siblings if s != art.slug])
        effective_min = min(MIN_CONTINUE_READING_LINKS, max(1, available_count))
        if len(cr_links) < effective_min:
            fixable.append(f"Continue Reading has {len(cr_links)} link(s) (min {effective_min})")

        # Check hub in CR
        if hub and not any(hub.rstrip('/') in url for url, _ in cr_links):
            fixable.append(f"Continue Reading missing hub link ({hub})")

        # Check siblings in CR
        if siblings:
            cr_urls = [url for url, _ in cr_links]
            sibling_count = sum(1 for s in siblings if any(s in u for u in cr_urls))
            min_siblings = min(2, len([s for s in siblings if s != art.slug]))
            if sibling_count < min_siblings:
                fixable.append(f"Continue Reading has {sibling_count} sibling link(s) (min {min_siblings})")

    return fixable, blocking


# ─── Stage 2: Editorial Layer ────────────────────────────────────────────────

def _truncate_title(title):
    """Shorten title to fit MAX_TITLE_RAW, preferring natural break points."""
    if len(title) <= MAX_TITLE_RAW:
        return title
    # Try subtitle after colon
    if ':' in title:
        base = title[:title.rindex(':')].strip()
        if MIN_TITLE <= len(base) <= MAX_TITLE_RAW:
            return base
    # Try dash separators
    for sep in [' — ', ' – ', ' - ']:
        if sep in title:
            base = title[:title.rindex(sep)].strip()
            if MIN_TITLE <= len(base) <= MAX_TITLE_RAW:
                return base
    # Word-boundary truncation
    truncated = title[:MAX_TITLE_RAW - 3]
    last_space = truncated.rfind(' ')
    if last_space > MIN_TITLE:
        truncated = truncated[:last_space]
    return truncated.rstrip('.,;:!? ') + "..."


def _truncate_excerpt(excerpt):
    """Shorten excerpt to MAX_EXCERPT, preferring sentence boundaries."""
    if len(excerpt) <= MAX_EXCERPT:
        return excerpt
    sentences = re.split(r'(?<=[.!?])\s+', excerpt)
    built = ""
    for s in sentences:
        candidate = (built + " " + s).strip() if built else s
        if len(candidate) <= MAX_EXCERPT:
            built = candidate
        else:
            break
    if built and len(built) >= MIN_EXCERPT:
        return built
    truncated = excerpt[:MAX_EXCERPT - 1]
    last_space = truncated.rfind(' ')
    if last_space > MIN_EXCERPT:
        truncated = truncated[:last_space]
    return truncated.rstrip('.,;:!? ') + "."


def _fix_slug(slug):
    """Normalize slug: lowercase, hyphens only."""
    slug = slug.lower().strip('/')
    slug = re.sub(r'[^a-z0-9\-]', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')


def _editorial_fix(articles, hub_url=None):
    """Apply auto-fixes in-place. Returns list of (slug, [fixes])."""
    log = []
    # Build sibling lookup
    slug_title_map = {a.slug: a.title for a in articles}

    for art in articles:
        fixes = []
        hub = _get_hub_url(art, hub_url)
        siblings = [a for a in articles if a.slug != art.slug]

        # ── Title ──
        rendered = f"{art.title}{BRAND_SUFFIX}"
        if len(rendered) > MAX_RENDERED_TITLE:
            old = art.title
            art.title = _truncate_title(art.title)
            fixes.append(f"title: \"{old}\" ({len(old)}) → \"{art.title}\" ({len(art.title)})")

        # ── Excerpt ──
        if len(art.excerpt) > MAX_EXCERPT:
            old_len = len(art.excerpt)
            art.excerpt = _truncate_excerpt(art.excerpt)
            fixes.append(f"excerpt: {old_len} → {len(art.excerpt)} chars")

        # ── Slug ──
        clean = _fix_slug(art.slug)
        if clean != art.slug:
            fixes.append(f"slug: \"{art.slug}\" → \"{clean}\"")
            art.slug = clean

        # ── Continue Reading section ──
        body, existing_cr = _split_continue_reading(art.content)

        if existing_cr:
            cr_links = _extract_cr_links(existing_cr)
            cr_modified = False

            # Ensure hub link is in CR
            if hub and not any(hub.rstrip('/') in url for url, _ in cr_links):
                # Determine hub label
                hub_labels = {
                    '/salem-ghost-tours/': 'Salem Ghost Tours Hub',
                    '/new-orleans-ghost-tours/': 'New Orleans Ghost Tours Hub',
                    '/chicago-ghost-tours/': 'Chicago Ghost Tours Hub',
                    '/destinations/draculas-castle/': "Dracula's Castle",
                }
                hub_label = hub_labels.get(hub, 'Ghost Tours Hub')
                cr_links.append((hub, hub_label))
                cr_modified = True
                fixes.append(f"injected hub link ({hub}) into Continue Reading")

            if cr_modified:
                art.content = body + _build_continue_reading(cr_links)

        else:
            # No Continue Reading — build one from scratch
            cr_links = []

            # Add up to 4 sibling links
            for sib in siblings[:4]:
                cr_links.append((f"/articles/{sib.slug}/", sib.title))

            # Add hub link
            if hub:
                hub_labels = {
                    '/salem-ghost-tours/': 'Salem Ghost Tours Hub',
                    '/new-orleans-ghost-tours/': 'New Orleans Ghost Tours Hub',
                    '/chicago-ghost-tours/': 'Chicago Ghost Tours Hub',
                    '/destinations/draculas-castle/': "Dracula's Castle",
                }
                cr_links.append((hub, hub_labels.get(hub, 'Ghost Tours Hub')))

            if cr_links:
                art.content = body + _build_continue_reading(cr_links)
                fixes.append(f"generated Continue Reading section ({len(cr_links)} links)")

        if fixes:
            log.append((art.slug, fixes))

    return log


# ─── Stage 3: Write Layer ────────────────────────────────────────────────────

def _write_to_disk(articles):
    """Write articles to JSON files."""
    os.makedirs(ARTICLE_DIR, exist_ok=True)
    for i, art in enumerate(articles):
        data = {
            "title": art.title,
            "slug": art.slug,
            "id": art.article_id or (70000 + i),
            "status": "publish",
            "post_type": "post",
            "uri": f"/articles/{art.slug}/",
            "date": art.date,
            "modified": art.date,
            "content": art.content,
            "excerpt": art.excerpt,
            "categories": [{
                "id": art.category_id or 0,
                "slug": art.category_slug,
                "name": art.category_name,
                "description": art.category_description,
            }],
            "pageType": "unassigned",
            "featuredImage": {
                "sourceUrl": art.image_url,
                "altText": art.image_alt,
            },
        }
        with open(os.path.join(ARTICLE_DIR, f"{art.slug}.json"), "w") as f:
            json.dump(data, f, indent=2)


# ─── Pipeline ────────────────────────────────────────────────────────────────

def publish_articles(articles, hub_url=None):
    """
    Full pipeline: QC → Editorial Fix → Final QC → Write.
    Returns True if published, False if blocked.
    
    hub_url: explicit hub page URL. If None, derived from category slug.
    """
    n = len(articles)
    sibling_slugs = [a.slug for a in articles]

    print()
    print("=" * 62)
    print(f"  ARTICLE PIPELINE — {n} articles")
    print("=" * 62)

    # ── Stage 1: QC ──
    print(f"\n  ┌─ STAGE 1: QC CHECK")
    total_fixable = 0
    total_blocking = 0
    for art in articles:
        fixable, blocking = _qc_one(art, hub_url, sibling_slugs)
        total_fixable += len(fixable)
        total_blocking += len(blocking)

    if total_fixable == 0 and total_blocking == 0:
        print(f"  │  ✓ All {n} articles clean")
    else:
        if total_fixable:
            print(f"  │  ⚠ {total_fixable} fixable issue(s) → editorial layer")
        if total_blocking:
            print(f"  │  ✗ {total_blocking} BLOCKING issue(s):")
            for art in articles:
                _, blocking = _qc_one(art, hub_url, sibling_slugs)
                for b in blocking:
                    print(f"  │      {art.slug}: {b}")
            print(f"  └─ ABORTED\n")
            return False
    print(f"  └─ Done")

    # ── Stage 2: Editorial Fix ──
    print(f"\n  ┌─ STAGE 2: EDITORIAL FIX")
    fix_log = _editorial_fix(articles, hub_url)
    if fix_log:
        print(f"  │  Fixed {len(fix_log)} article(s):")
        for slug, fixes in fix_log:
            for fix in fixes:
                print(f"  │    {slug}: {fix}")
    else:
        print(f"  │  ✓ No fixes needed")
    print(f"  └─ Done")

    # ── Stage 3: Final QC ──
    print(f"\n  ┌─ STAGE 3: FINAL QC")
    remaining = 0
    for art in articles:
        fixable, blocking = _qc_one(art, hub_url, sibling_slugs)
        for issue in fixable + blocking:
            print(f"  │  ✗ {art.slug}: {issue}")
            remaining += 1

    if remaining:
        print(f"  │  ✗ {remaining} issue(s) remain")
        print(f"  └─ ABORTED\n")
        return False

    print(f"  │  ✓ All {n} articles pass final QC")
    print(f"  └─ Done")

    # ── Stage 4: Write ──
    print(f"\n  ┌─ STAGE 4: WRITE")
    _write_to_disk(articles)
    total_words = sum(len(re.sub(r'<[^>]+>', ' ', a.content).split()) for a in articles)
    print(f"  │  ✓ {n} articles ({total_words:,} words) → {ARTICLE_DIR}/")

    for art in articles:
        rendered = f"{art.title}{BRAND_SUFFIX}"
        body, cr = _split_continue_reading(art.content)
        body_links = len(re.findall(r'href="(/[^"]*)"', body))
        cr_links = len(_extract_cr_links(cr)) if cr else 0
        wc = len(re.sub(r'<[^>]+>', ' ', art.content).split())
        hub = _get_hub_url(art, hub_url)
        has_hub = "✓hub" if hub and hub in art.content else ("—" if not hub else "✗hub")
        print(f"  │    ✓ {art.slug}")
        print(f"  │        {len(rendered)}t | {len(art.excerpt)}e | {wc}w | {body_links}body+{cr_links}cr links | {has_hub}")

    print(f"  └─ Done")
    print(f"\n  ✓ {n} articles published.")
    print("=" * 62)
    print()
    return True


# ─── Repair existing articles (hub links) ────────────────────────────────────

def repair_hub_links():
    """Inject missing hub links into Continue Reading sections of existing articles."""
    print(f"\n  Repairing hub links in existing articles...\n")
    repaired = 0

    for fname in sorted(os.listdir(ARTICLE_DIR)):
        if not fname.endswith('.json'):
            continue
        path = os.path.join(ARTICLE_DIR, fname)
        with open(path) as f:
            d = json.load(f)

        cat_slug = d['categories'][0]['slug'] if d.get('categories') else ''
        hub = CATEGORY_HUBS.get(cat_slug)
        if not hub:
            continue

        content = d.get('content', '')
        if hub.rstrip('/') in content:
            continue  # already has hub link

        body, cr = _split_continue_reading(content)
        if not cr:
            continue  # no CR section to inject into — skip

        cr_links = _extract_cr_links(cr)

        hub_labels = {
            '/salem-ghost-tours/': 'Salem Ghost Tours Hub',
            '/new-orleans-ghost-tours/': 'New Orleans Ghost Tours Hub',
            '/chicago-ghost-tours/': 'Chicago Ghost Tours Hub',
            '/destinations/draculas-castle/': "Dracula's Castle",
        }
        cr_links.append((hub, hub_labels.get(hub, 'Ghost Tours Hub')))
        d['content'] = body + _build_continue_reading(cr_links)

        with open(path, 'w') as f:
            json.dump(d, f, indent=2)

        print(f"    ✓ {d['slug']}: injected {hub} into Continue Reading")
        repaired += 1

    print(f"\n  Repaired {repaired} articles.\n")
    return repaired


# ─── CLI ─────────────────────────────────────────────────────────────────────

def audit_existing():
    """Validate all existing article JSON files."""
    print(f"\n  Auditing {ARTICLE_DIR}/\n")
    errors = []
    count = 0

    for fname in sorted(os.listdir(ARTICLE_DIR)):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(ARTICLE_DIR, fname)) as f:
            d = json.load(f)

        count += 1
        slug = d.get("slug", fname.replace(".json", ""))
        title = d.get("title", "")
        excerpt = d.get("excerpt", "")
        content = d.get("content", "")
        img = d.get("featuredImage", {})
        cats = d.get("categories", [])
        cat_slug = cats[0]['slug'] if cats else ''
        hub = CATEGORY_HUBS.get(cat_slug)

        rendered = f"{title}{BRAND_SUFFIX}"
        text_only = re.sub(r'<[^>]+>', ' ', content)
        wc = len(text_only.split())

        body, cr = _split_continue_reading(content)
        body_links = len(re.findall(r'href="(/[^"]*)"', body))
        cr_links = _extract_cr_links(cr) if cr else []
        has_hub = hub and hub.rstrip('/') in content

        issues = []
        if len(rendered) > MAX_RENDERED_TITLE:
            issues.append(f"title {len(rendered)} chars (max {MAX_RENDERED_TITLE})")
        if len(title) < MIN_TITLE:
            issues.append(f"title {len(title)} chars (min {MIN_TITLE})")
        if len(excerpt) > MAX_EXCERPT:
            issues.append(f"excerpt {len(excerpt)} chars (max {MAX_EXCERPT})")
        if len(excerpt) < MIN_EXCERPT:
            issues.append(f"excerpt {len(excerpt)} chars (min {MIN_EXCERPT})")
        if wc < MIN_WORD_COUNT:
            issues.append(f"only {wc} words (min {MIN_WORD_COUNT})")
        if body_links < 1:
            issues.append("no internal links in body")
        if not img.get("sourceUrl"):
            issues.append("no featured image")
        if not cats:
            issues.append("no category")
        if not cr:
            issues.append("no Continue Reading section")
        elif len(cr_links) < MIN_CONTINUE_READING_LINKS:
            issues.append(f"Continue Reading has {len(cr_links)} links (min {MIN_CONTINUE_READING_LINKS})")
        if hub and not has_hub:
            issues.append(f"missing hub link ({hub})")
        if cat_slug and cat_slug not in CATEGORY_HUBS:
            issues.append(f"category '{cat_slug}' not in CATEGORY_HUBS")

        if issues:
            errors.append((slug, issues))

    if errors:
        print(f"  ✗ {len(errors)} of {count} articles have issues:\n")
        for slug, issues in errors:
            print(f"    {slug}: {'; '.join(issues)}")
        print()
        return False
    else:
        print(f"  ✓ All {count} articles pass full SEO + linking audit.\n")
        return True


if __name__ == "__main__":
    import sys
    if '--repair' in sys.argv:
        repair_hub_links()
    audit_existing()
