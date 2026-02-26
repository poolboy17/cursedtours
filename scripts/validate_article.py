#!/usr/bin/env python3
"""
validate_article.py — Post-Write Validation Layer
===================================================
Run IMMEDIATELY after writing any article JSON to catch encoding bugs,
structural errors, and SEO issues before they reach production.

Usage:
    python validate_article.py article-slug              # validate one
    python validate_article.py article-slug --fix        # validate + auto-fix mojibake
    python validate_article.py --all                     # validate entire corpus
    python validate_article.py --all --fix               # validate + fix entire corpus
    python validate_article.py --recent 5                # validate 5 most recently modified

Exit codes:
    0 = all BLOCK checks pass
    1 = one or more BLOCK failures (article should NOT be deployed)
    2 = file not found or invalid JSON

Integration:
    Call this after every json.dump() in the content generation pipeline.
    The blog-architect skill should run this as the final step of Phase 6.
"""
import json, re, os, sys, glob, argparse
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent
ARTICLES_DIR = BASE_DIR / "src" / "data" / "articles"

# ============================================================
# MOJIBAKE DETECTION + FIX
# ============================================================
def build_mojibake_map():
    """Build mojibake reversal map for common UTF-8 → cp1252 corruption.
    
    Covers Latin-1 Supplement (U+0080..U+00FF), Latin Extended (U+0100..U+024F),
    and General Punctuation (U+2000..U+206F) which covers all real-world mojibake:
    accented chars, em/en dashes, smart quotes, bullets, etc.
    """
    replacements = {}
    # Targeted ranges instead of full 0x0080..0xFFFF (54K chars → ~1K chars)
    ranges = [
        (0x0080, 0x0100),  # Latin-1 Supplement (é, ñ, ü, etc.)
        (0x0100, 0x0250),  # Latin Extended-A/B (ā, ě, ő, etc.)
        (0x2000, 0x2070),  # General Punctuation (—, ', ", •, etc.)
        (0x20A0, 0x20D0),  # Currency Symbols (€, etc.)
        (0x2100, 0x2150),  # Letterlike Symbols
    ]
    for start, end in ranges:
        for cp in range(start, end):
            try:
                char = chr(cp)
                utf8_bytes = char.encode('utf-8')
                mangled = utf8_bytes.decode('cp1252')
                if mangled != char:
                    replacements[mangled] = char
            except (UnicodeEncodeError, UnicodeDecodeError):
                pass
    return replacements

MOJIBAKE_MAP = build_mojibake_map()
MOJIBAKE_KEYS = sorted(MOJIBAKE_MAP.keys(), key=len, reverse=True)

def detect_mojibake(text):
    """Detect mojibake sequences in text. Returns list of (bad_sequence, good_char, count)."""
    found = []
    for bad in MOJIBAKE_KEYS:
        count = text.count(bad)
        if count > 0:
            found.append((bad, MOJIBAKE_MAP[bad], count))
    return found

def fix_mojibake(text):
    """Fix all mojibake sequences. Returns (fixed_text, fix_count)."""
    fix_count = 0
    for bad in MOJIBAKE_KEYS:
        if bad in text:
            count = text.count(bad)
            text = text.replace(bad, MOJIBAKE_MAP[bad])
            fix_count += count
    return text, fix_count

# ============================================================
# BANNED PHRASES
# ============================================================
# Synced with semanticpipe.py BANNED_PHRASES — keep these identical
BANNED_PHRASES = [
    'journey','unlock','game-changer','dive in','explore the depths',
    'delve','realm','furthermore','in conclusion','nestled',
    "it's important to note","in today's world",'it should be noted',
    'needless to say','as we all know','without further ado',
    'spine-tingling','bone-chilling','hair-raising','reportedly haunted',
]

# ============================================================
# VALIDATOR
# ============================================================
def strip_html(html):
    return re.sub(r'<[^>]+>', '', html)

def validate(filepath, fix=False, verbose=True):
    """Validate a single article JSON file.
    
    Returns dict with:
        path, slug, blocks[], warns[], fixed, saved
    """
    result = {
        'path': str(filepath),
        'slug': filepath.stem,
        'blocks': [],
        'warns': [],
        'fixed': False,
        'saved': False,
    }
    
    # --- Load ---
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            article = json.load(f)
    except json.JSONDecodeError as e:
        result['blocks'].append(f'B1: Invalid JSON — {e}')
        return result
    except Exception as e:
        result['blocks'].append(f'B1: Cannot read file — {e}')
        return result

    content = article.get('content', '')
    title = article.get('title', '')
    excerpt = article.get('excerpt', '')
    plain = strip_html(content)
    wc = len(plain.split())
    slug = article.get('slug', filepath.stem)
    result['slug'] = slug
    
    # Load all slugs for broken link check
    all_slugs = {p.stem for p in ARTICLES_DIR.glob('*.json')}
    
    # --- BLOCK checks (must pass) ---
    
    # B4: No H1 in body
    h1c = len(re.findall(r'<h1[> ]', content, re.I))
    if h1c > 0:
        result['blocks'].append(f'B4: {h1c} H1 tags in body (template handles title)')
    
    # B6: Word count
    if wc < 1000:
        result['blocks'].append(f'B6: Only {wc} words (minimum 1000)')
    
    # B7: Banned phrases (check body only, not Continue Reading footer)
    body_html = content.split('<hr')[0] if '<hr' in content else content
    body_plain = strip_html(body_html)
    found_banned = []
    for b in BANNED_PHRASES:
        if re.search(r'\b' + re.escape(b) + r'\b', body_plain, re.I):
            found_banned.append(b)
    if found_banned:
        result['blocks'].append(f'B7: Banned phrases: {found_banned}')

    # B8: Mojibake detection
    mojibake_hits = detect_mojibake(content + title + excerpt)
    title_mojibake = detect_mojibake(title)
    excerpt_mojibake = detect_mojibake(excerpt)
    
    if mojibake_hits:
        total = sum(c for _, _, c in mojibake_hits)
        samples = [(bad, good) for bad, good, _ in mojibake_hits[:5]]
        
        if fix:
            # Auto-fix mojibake
            article['content'], c1 = fix_mojibake(article['content'])
            article['title'], c2 = fix_mojibake(article['title'])
            article['excerpt'], c3 = fix_mojibake(article['excerpt'])
            fixed_total = c1 + c2 + c3
            if fixed_total > 0:
                result['fixed'] = True
                if verbose:
                    print(f'  FIXED: {fixed_total} mojibake sequences')
                # Re-check after fix
                remaining = detect_mojibake(article['content'] + article['title'] + article['excerpt'])
                if remaining:
                    result['blocks'].append(f'B8: {len(remaining)} mojibake sequences remain after fix')
                # Save fixed file
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(article, f, ensure_ascii=False, indent=2)
                result['saved'] = True
        else:
            result['blocks'].append(
                f'B8: {total} mojibake sequences (e.g. {samples[0][0]!r} → {samples[0][1]!r}). '
                f'Run with --fix to auto-repair.'
            )

    # B10: No self-links
    body = content.split('<hr')[0] if '<hr' in content else content
    self_links = [l for l in re.findall(r'href=["\']([^"\']+)["\']', body)
                  if slug in l and '/articles/' in l]
    if self_links:
        result['blocks'].append(f'B10: Self-link found: {self_links[0]}')
    
    # B11: Broken internal links
    art_links = re.findall(r'href=["\'](?:/articles/([^"\']+?)/)["\']', content)
    broken = [s for s in art_links if s not in all_slugs]
    if broken:
        result['blocks'].append(f'B11: Broken links: {broken}')
    
    # B14: Featured image
    fi = article.get('featuredImage', {})
    if not (fi.get('sourceUrl') and fi.get('altText')):
        result['blocks'].append(f'B14: Missing featuredImage sourceUrl or altText')
    
    # --- WARN checks (tracked, not enforced) ---
    if len(title) > 60:
        result['warns'].append(f'B2: Title {len(title)} chars (prefer ≤60)')
    if len(excerpt) > 155:
        result['warns'].append(f'B3: Excerpt {len(excerpt)} chars (prefer ≤155)')
    
    h2c = len(re.findall(r'<h2[> ]', content, re.I))
    max_h2 = 16 if wc >= 2000 else 8
    if not (4 <= h2c <= max_h2):
        result['warns'].append(f'B5: {h2c} H2s (prefer 4-{max_h2} for {wc}w)')
    
    body_links = re.findall(r'href=["\'](?:/articles/|/blog/)', body)
    if len(body_links) < 3:
        result['warns'].append(f'B9: Only {len(body_links)} body links (prefer 3+)')
    
    return result

# ============================================================
# CLI
# ============================================================
def main():
    parser = argparse.ArgumentParser(description='Post-write article validator')
    parser.add_argument('slugs', nargs='*', help='Article slug(s) to validate')
    parser.add_argument('--all', action='store_true', help='Validate all articles')
    parser.add_argument('--recent', type=int, default=0, help='Validate N most recently modified')
    parser.add_argument('--fix', action='store_true', help='Auto-fix mojibake')
    parser.add_argument('--quiet', action='store_true', help='Only show failures')
    args = parser.parse_args()
    
    files = []
    if args.all:
        files = sorted(ARTICLES_DIR.glob('*.json'))
    elif args.recent:
        all_files = list(ARTICLES_DIR.glob('*.json'))
        all_files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        files = all_files[:args.recent]
    elif args.slugs:
        for s in args.slugs:
            s = s.replace('.json', '')
            p = ARTICLES_DIR / f'{s}.json'
            if p.exists():
                files.append(p)
            else:
                print(f'ERROR: {p} not found')
                sys.exit(2)
    else:
        parser.print_help()
        sys.exit(0)

    total_blocks = 0
    total_warns = 0
    total_fixed = 0
    block_articles = []
    
    print(f'\nValidating {len(files)} article(s)...\n')
    
    for filepath in files:
        r = validate(filepath, fix=args.fix, verbose=not args.quiet)
        
        if r['blocks'] or r['warns'] or not args.quiet:
            status = 'BLOCK' if r['blocks'] else ('WARN' if r['warns'] else 'OK')
            icon = {'BLOCK': 'X', 'WARN': '!', 'OK': '+'}[status]
            print(f'  [{icon}] {r["slug"]}')
            
            for b in r['blocks']:
                print(f'      BLOCK: {b}')
            for w in r['warns']:
                print(f'      WARN:  {w}')
            if r['fixed']:
                print(f'      FIXED: mojibake auto-repaired and saved')
        
        total_blocks += len(r['blocks'])
        total_warns += len(r['warns'])
        if r['fixed']:
            total_fixed += 1
        if r['blocks']:
            block_articles.append(r['slug'])
    
    # Summary
    print(f'\n{"="*60}')
    print(f'VALIDATION COMPLETE')
    print(f'{"="*60}')
    print(f'  Articles:  {len(files)}')
    print(f'  BLOCK:     {total_blocks} issues across {len(block_articles)} articles')
    print(f'  WARN:      {total_warns} issues')
    if args.fix:
        print(f'  Fixed:     {total_fixed} articles (mojibake auto-repaired)')
    print(f'{"="*60}')
    
    if block_articles:
        print(f'\nBLOCKED articles (do NOT deploy):')
        for s in block_articles:
            print(f'  - {s}')
        sys.exit(1)
    else:
        print(f'\nAll articles pass BLOCK checks.')
        sys.exit(0)

if __name__ == '__main__':
    main()
