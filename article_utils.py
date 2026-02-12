#!/usr/bin/env python3
"""
Article generator with SEO validation for CursedTours.com.

Usage as a module in generation scripts:

    from article_utils import Article, write_articles, validate_articles

    articles = [
        Article(
            title="The Great Fire of 1871",         # max 50 chars (+ " | Cursed Tours" = 65)
            slug="great-fire-1871",
            excerpt="Short meta description.",       # max 160 chars
            category_slug="chicago-haunted-history",
            category_name="Chicago Haunted History",
            image_url="https://images.unsplash.com/...",
            image_alt="Description of image",
            content="<h2>Section</h2>\\n<p>Content here...</p>",
        ),
    ]

    # Validate only (dry run)
    validate_articles(articles)

    # Write to disk (validates first, aborts on failures)
    write_articles(articles)

SEO constraints enforced:
  - Title: max 50 chars (rendered as "{title} | Cursed Tours" = max 65)
  - Excerpt / meta description: max 160 chars, min 50 chars
  - Slug: lowercase, hyphens only, no trailing slash
  - Content word count: min 500 words
  - Featured image: required
  - Category: required
  - Internal links: at least 1 in content
"""

import json, os, re, sys
from dataclasses import dataclass, field
from typing import Optional

BRAND_SUFFIX = " | Cursed Tours"
MAX_TITLE_RAW = 50          # 50 + 15 (" | Cursed Tours") = 65
MAX_RENDERED_TITLE = 65
MIN_TITLE = 10
MAX_EXCERPT = 160
MIN_EXCERPT = 50
MIN_WORD_COUNT = 500
ARTICLE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "data", "articles")


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


def _validate_one(art: Article, index: int) -> list[str]:
    """Validate a single article. Returns list of error strings."""
    errors = []
    prefix = f"[{index+1}] {art.slug}"

    # Title
    rendered = f"{art.title}{BRAND_SUFFIX}"
    if len(art.title) < MIN_TITLE:
        errors.append(f"{prefix}: title too short ({len(art.title)} chars, min {MIN_TITLE})")
    if len(rendered) > MAX_RENDERED_TITLE:
        errors.append(
            f"{prefix}: title too long → \"{rendered}\" "
            f"({len(rendered)} chars, max {MAX_RENDERED_TITLE}). "
            f"Shorten raw title to ≤{MAX_TITLE_RAW} chars (currently {len(art.title)})."
        )

    # Excerpt / meta description
    if len(art.excerpt) < MIN_EXCERPT:
        errors.append(f"{prefix}: excerpt too short ({len(art.excerpt)} chars, min {MIN_EXCERPT})")
    if len(art.excerpt) > MAX_EXCERPT:
        errors.append(
            f"{prefix}: excerpt too long ({len(art.excerpt)} chars, max {MAX_EXCERPT}). "
            f"Trim {len(art.excerpt) - MAX_EXCERPT} chars."
        )

    # Slug
    if art.slug != art.slug.lower():
        errors.append(f"{prefix}: slug must be lowercase")
    if re.search(r'[^a-z0-9\-]', art.slug):
        errors.append(f"{prefix}: slug contains invalid chars (use lowercase + hyphens only)")
    if art.slug.endswith('/'):
        errors.append(f"{prefix}: slug should not end with /")

    # Content
    text_only = re.sub(r'<[^>]+>', ' ', art.content)
    word_count = len(text_only.split())
    if word_count < MIN_WORD_COUNT:
        errors.append(f"{prefix}: content too thin ({word_count} words, min {MIN_WORD_COUNT})")

    # Internal links
    internal_links = re.findall(r'href="(/[^"]*)"', art.content)
    if len(internal_links) < 1:
        errors.append(f"{prefix}: no internal links in content (need ≥1)")

    # Image
    if not art.image_url:
        errors.append(f"{prefix}: missing featured image URL")
    if not art.image_alt:
        errors.append(f"{prefix}: missing featured image alt text")

    # Category
    if not art.category_slug:
        errors.append(f"{prefix}: missing category slug")

    return errors


def validate_articles(articles: list[Article]) -> bool:
    """Validate all articles. Prints report. Returns True if all pass."""
    all_errors = []
    print(f"\n  Validating {len(articles)} articles...\n")

    for i, art in enumerate(articles):
        errs = _validate_one(art, i)
        if errs:
            all_errors.extend(errs)
        else:
            rendered_title = f"{art.title}{BRAND_SUFFIX}"
            text_only = re.sub(r'<[^>]+>', ' ', art.content)
            wc = len(text_only.split())
            print(f"  ✓ {art.slug}")
            print(f"      title: {len(rendered_title)} chars | excerpt: {len(art.excerpt)} chars | {wc} words")

    if all_errors:
        print(f"\n  ✗ {len(all_errors)} ERRORS:\n")
        for e in all_errors:
            print(f"    {e}")
        print()
        return False

    print(f"\n  ✓ All {len(articles)} articles pass SEO validation.\n")
    return True


def write_articles(articles: list[Article], force: bool = False) -> None:
    """Validate and write articles to JSON files. Aborts on validation failure unless force=True."""
    passed = validate_articles(articles)

    if not passed and not force:
        print("  ABORTED: Fix errors above before writing. Use force=True to override.\n")
        sys.exit(1)

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
            "categories": [
                {
                    "id": art.category_id or 0,
                    "slug": art.category_slug,
                    "name": art.category_name,
                    "description": art.category_description,
                }
            ],
            "pageType": "unassigned",
            "featuredImage": {
                "sourceUrl": art.image_url,
                "altText": art.image_alt,
            },
        }

        filepath = os.path.join(ARTICLE_DIR, f"{art.slug}.json")
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)

    text_only_all = sum(len(re.sub(r'<[^>]+>', ' ', a.content).split()) for a in articles)
    print(f"  Wrote {len(articles)} articles ({text_only_all:,} total words) to {ARTICLE_DIR}/\n")


# --- CLI: validate existing articles on disk ---
if __name__ == "__main__":
    print("\n  Checking existing articles in", ARTICLE_DIR)
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

        rendered = f"{title}{BRAND_SUFFIX}"
        text_only = re.sub(r'<[^>]+>', ' ', content)
        wc = len(text_only.split())
        internal_links = len(re.findall(r'href="(/[^"]*)"', content))

        issues = []
        if len(rendered) > MAX_RENDERED_TITLE:
            issues.append(f"title {len(rendered)} chars (max {MAX_RENDERED_TITLE})")
        if len(excerpt) > MAX_EXCERPT:
            issues.append(f"excerpt {len(excerpt)} chars (max {MAX_EXCERPT})")
        if len(excerpt) < MIN_EXCERPT:
            issues.append(f"excerpt {len(excerpt)} chars (min {MIN_EXCERPT})")
        if wc < MIN_WORD_COUNT:
            issues.append(f"only {wc} words (min {MIN_WORD_COUNT})")
        if internal_links < 1:
            issues.append("no internal links")
        if not img.get("sourceUrl"):
            issues.append("no featured image")
        if not cats:
            issues.append("no category")

        if issues:
            errors.append((slug, issues))

    if errors:
        print(f"\n  ✗ {len(errors)} articles with issues:\n")
        for slug, issues in errors:
            print(f"    {slug}: {'; '.join(issues)}")
    else:
        print(f"\n  ✓ All {count} articles pass SEO validation.\n")
