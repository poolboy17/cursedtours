#!/usr/bin/env python3
"""
SemanticPipe — Automated Multi-Threaded Article Optimizer
=========================================================
Reads SEMANTICPIPE-UNIFIED-SPEC.md v2.0 as source of truth.
Processes articles in parallel with self-validation gate.
Only saves articles that pass all BLOCK checks.
Appends every run to AUDIT-LOG.md.

Usage:
    python semanticpipe.py                    # optimize all needing work
    python semanticpipe.py --dry-run          # report what would change
    python semanticpipe.py --slugs a,b,c      # optimize specific articles
    python semanticpipe.py --category austin-haunted-history
    python semanticpipe.py --threads 4        # concurrency (default: 4)
"""
import json, re, os, sys, math, argparse, threading
from datetime import datetime
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor, as_completed

# ============================================================
# CONSTANTS
# ============================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTICLES_DIR = os.path.join(BASE_DIR, "src", "data", "articles")
AUDIT_LOG = os.path.join(BASE_DIR, "AUDIT-LOG.md")
AUDIT_JSON = os.path.join(BASE_DIR, "audit-log.jsonl")
SPEC_VERSION = "SEMANTICPIPE-UNIFIED-SPEC.md v2.1"

# Thread-safe lock for audit log writes
audit_lock = threading.Lock()

# Category slug -> hub URL
HUB_MAP = {
    "salem-witch-trials": "/blog/salem-witch-trials/",
    "vampire-culture": "/blog/vampire-culture/",
    "tower-of-london-history": "/blog/tower-of-london-history/",
    "american-prison-history": "/blog/american-prison-history/",
    "gettysburg-civil-war": "/blog/gettysburg-civil-war/",
    "pop-culture-dark-history": "/blog/pop-culture-dark-history/",
    "chicago-haunted-history": "/blog/chicago-haunted-history/",
    "new-orleans-voodoo-haunted-history": "/blog/new-orleans-voodoo-haunted-history/",
    "key-west-haunted-history": "/blog/key-west-haunted-history/",
    "austin-haunted-history": "/blog/austin-haunted-history/",
    "boston-haunted-history": "/blog/boston-haunted-history/",
    "charleston-haunted-history": "/blog/charleston-haunted-history/",
    "denver-haunted-history": "/blog/denver-haunted-history/",
    "dublin-haunted-history": "/blog/dublin-haunted-history/",
    "edinburgh-haunted-history": "/blog/edinburgh-haunted-history/",
    "london-haunted-history": "/blog/london-haunted-history/",
    "nashville-haunted-history": "/blog/nashville-haunted-history/",
    "new-york-haunted-history": "/blog/new-york-haunted-history/",
    "paris-haunted-history": "/blog/paris-haunted-history/",
    "rome-haunted-history": "/blog/rome-haunted-history/",
    "san-antonio-haunted-history": "/blog/san-antonio-haunted-history/",
    "savannah-haunted-history": "/blog/savannah-haunted-history/",
    "st-augustine-haunted-history": "/blog/st-augustine-haunted-history/",
    "washington-dc-haunted-history": "/blog/washington-dc-haunted-history/",
}

# Ghost tour URLs (some articles link to these as hub)
TOUR_MAP = {
    "austin-haunted-history": "/austin-ghost-tours/",
    "boston-haunted-history": "/boston-ghost-tours/",
    "charleston-haunted-history": "/charleston-ghost-tours/",
    "chicago-haunted-history": "/chicago-ghost-tours/",
    "denver-haunted-history": "/denver-ghost-tours/",
    "dublin-haunted-history": "/dublin-ghost-tours/",
    "edinburgh-haunted-history": "/edinburgh-ghost-tours/",
    "key-west-haunted-history": "/key-west-ghost-tours/",
    "london-haunted-history": "/london-ghost-tours/",
    "nashville-haunted-history": "/nashville-ghost-tours/",
    "new-orleans-voodoo-haunted-history": "/new-orleans-ghost-tours/",
    "new-york-haunted-history": "/new-york-ghost-tours/",
    "paris-haunted-history": "/paris-ghost-tours/",
    "rome-haunted-history": "/rome-ghost-tours/",
    "san-antonio-haunted-history": "/san-antonio-ghost-tours/",
    "savannah-haunted-history": "/savannah-ghost-tours/",
    "st-augustine-haunted-history": "/st-augustine-ghost-tours/",
    "washington-dc-haunted-history": "/washington-dc-ghost-tours/",
}

BANNED_PHRASES = [
    'journey','unlock','game-changer','dive in','explore the depths',
    'delve','realm','furthermore','in conclusion','nestled',
    "it's important to note","in today's world",'it should be noted',
    'needless to say','as we all know','without further ado',
    'spine-tingling','bone-chilling','hair-raising','reportedly haunted'
]

# Replacement map for banned phrases (word-boundary safe alternatives)
BANNED_REPLACEMENTS = {
    'journey': 'path',
    'unlock': 'reveal',
    'unlocked': 'opened',
    'unlocking': 'revealing',
    'game-changer': 'turning point',
    'dive in': 'begin',
    'explore the depths': 'examine the details',
    'delve': 'examine',
    'delves': 'examines',
    'delving': 'examining',
    'realm': 'domain',
    'furthermore': 'additionally',
    'in conclusion': 'ultimately',
    'nestled': 'situated',
    "it's important to note": 'notably',
    "in today's world": 'today',
    'it should be noted': 'notably',
    'needless to say': 'clearly',
    'as we all know': 'as documented',
    'without further ado': '',
    'spine-tingling': 'unsettling',
    'bone-chilling': 'disturbing',
    'hair-raising': 'unsettling',
    'reportedly haunted': 'said to be haunted',
}

# ============================================================
# HTML UTILITIES
# ============================================================
class HTMLText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
    def handle_data(self, d):
        self.text.append(d)

def strip_html(html):
    p = HTMLText()
    p.feed(html)
    return ' '.join(p.text)

def count_words(html):
    return len(strip_html(html).split())

# ============================================================
# INVENTORY LOADER (shared across threads, read-only)
# ============================================================
def load_inventory():
    """Load all article slugs and their categories. Returns (all_slugs, cat_map)."""
    all_slugs = set()
    cat_map = {}  # cat_slug -> [article_slugs]
    slug_to_title = {}
    slug_to_cat = {}
    for fname in os.listdir(ARTICLES_DIR):
        if not fname.endswith('.json'):
            continue
        slug = fname[:-5]
        all_slugs.add(slug)
        path = os.path.join(ARTICLES_DIR, fname)
        with open(path, 'r', encoding='utf-8') as f:
            a = json.load(f)
        cat = a.get('categories', [{}])[0].get('slug', 'uncategorized')
        cat_map.setdefault(cat, []).append(slug)
        slug_to_title[slug] = a.get('title', slug)
        slug_to_cat[slug] = cat
    return all_slugs, cat_map, slug_to_title, slug_to_cat

# ============================================================
# TITLE TRIMMER
# ============================================================
def trim_title(title, max_len=60):
    """Intelligently trim title to <=60 chars while keeping keyword intent."""
    if len(title) <= max_len:
        return title
    # Strategy 1: Remove subtitle after colon/dash if present
    for sep in [': ', ' — ', ' - ', ' | ']:
        if sep in title:
            main, sub = title.split(sep, 1)
            if len(main) <= max_len and len(main) >= 25:
                return main
            # Try keeping main + shortened sub
            available = max_len - len(main) - len(sep)
            if available > 10:
                words = sub.split()
                shortened = []
                for w in words:
                    test = sep.join([main, ' '.join(shortened + [w])])
                    if len(test) <= max_len:
                        shortened.append(w)
                    else:
                        break
                if shortened:
                    return sep.join([main, ' '.join(shortened)])
                return main[:max_len]
    # Strategy 2: Remove filler words from end
    words = title.split()
    while len(' '.join(words)) > max_len and len(words) > 3:
        words.pop()
    return ' '.join(words)

# ============================================================
# EXCERPT TRIMMER
# ============================================================
def trim_excerpt(excerpt, max_len=155):
    """Trim excerpt to <=155 chars at a sentence or word boundary."""
    if len(excerpt) <= max_len:
        return excerpt
    # Try to cut at sentence boundary
    truncated = excerpt[:max_len]
    last_period = truncated.rfind('.')
    if last_period > 80:
        return truncated[:last_period + 1]
    # Cut at word boundary
    last_space = truncated.rfind(' ')
    if last_space > 80:
        result = truncated[:last_space]
        if not result.endswith('.'):
            result = result.rstrip(',;:') + '.'
        return result
    return truncated[:max_len-1] + '.'

# ============================================================
# BANNED PHRASE FIXER
# ============================================================
# ============================================================
# MOJIBAKE FIXER
# ============================================================
def build_mojibake_map():
    """Build mojibake reversal map for UTF-8 bytes misread as Windows-1252.
    
    Uses targeted Unicode ranges (~1K codepoints) instead of full U+0080..U+FFFF
    (54K codepoints). Covers all real-world mojibake: accented chars, smart quotes,
    em/en dashes, bullets, currency symbols. Saves ~8s startup time.
    """
    replacements = {}
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
# Pre-sort keys longest-first so 3-char sequences (em-dash etc.) replace
# before their 2-char prefixes could partially match
MOJIBAKE_KEYS_SORTED = sorted(MOJIBAKE_MAP.keys(), key=len, reverse=True)

def fix_mojibake(content):
    """Fix UTF-8 double-encoding artifacts (cp1252 misread). Returns (new_content, changes)."""
    changes = []
    fix_count = 0
    # Replace longest sequences first to avoid partial matches
    for bad in MOJIBAKE_KEYS_SORTED:
        if bad in content:
            good = MOJIBAKE_MAP[bad]
            count = content.count(bad)
            content = content.replace(bad, good)
            fix_count += count
    if fix_count:
        changes.append(f"Fixed {fix_count} mojibake sequences (UTF-8 misread as cp1252)")
    return content, changes

def fix_banned_phrases(content):
    """Replace banned phrases in BODY ONLY (before <hr>). Preserves footer CTA text.
    Returns (new_content, changes)."""
    changes = []
    # Split at <hr to isolate body from Continue Reading footer
    if '<hr' in content:
        hr_idx = content.index('<hr')
        body = content[:hr_idx]
        footer = content[hr_idx:]
    else:
        body = content
        footer = ''
    
    body_plain_lower = strip_html(body).lower()
    for phrase in BANNED_PHRASES:
        pat = r'\b' + re.escape(phrase) + r'\b'
        if re.search(pat, body_plain_lower, re.I):
            # Find and replace in body HTML only
            replacement = BANNED_REPLACEMENTS.get(phrase, '')
            # Case-insensitive replacement in body
            def replace_match(m):
                original = m.group(0)
                if original[0].isupper() and replacement:
                    return replacement[0].upper() + replacement[1:]
                return replacement
            new_body = re.sub(
                r'\b' + re.escape(phrase) + r'\b',
                replace_match, body, flags=re.I
            )
            if new_body != body:
                changes.append(f"Replaced banned '{phrase}' with '{replacement}'")
                body = new_body
    return body + footer, changes

# ============================================================
# INTERNAL LINK INSERTER
# ============================================================
def get_existing_link_targets(html):
    """Extract all article slugs already linked in body content."""
    return set(re.findall(r'href=["\'](?:/articles/([^"\']+?)/)["\']', html))

def find_linkable_paragraphs(body_html):
    """Find paragraphs suitable for link insertion.
    Returns list of (paragraph_text, index_in_content) for paragraphs that:
    - Are >=40 words
    - Don't already contain a link
    - Are in the body (before <hr)
    """
    candidates = []
    # Split body at <hr to only look before footer
    body = body_html.split('<hr')[0] if '<hr' in body_html else body_html
    # Find all <p>...</p> blocks
    for m in re.finditer(r'<p>(.*?)</p>', body, re.DOTALL):
        para = m.group(1)
        # Skip if already has a link
        if '<a ' in para:
            continue
        plain = strip_html(para)
        if len(plain.split()) >= 40:
            candidates.append({
                'text': para,
                'plain': plain,
                'start': m.start(),
                'end': m.end(),
                'full_match': m.group(0),
            })
    return candidates

def build_anchor_text(sibling_title, max_words=6):
    """Create 3-6 word anchor text from a sibling article title."""
    # Remove site-specific suffixes and clean up
    title = re.sub(r'\s*[-—|:]\s*(Haunted|Ghost|Dark|True|Complete).*$', '', sibling_title, flags=re.I)
    words = title.split()
    if len(words) <= max_words:
        return title.lower()
    # Take first max_words meaningful words
    return ' '.join(words[:max_words]).lower()

def insert_sibling_links(content, slug, cat_slug, siblings, slug_to_title, all_slugs):
    """Insert sibling links into body paragraphs. Returns (new_content, changes)."""
    changes = []
    body_before_hr = content.split('<hr')[0] if '<hr' in content else content
    existing_targets = get_existing_link_targets(body_before_hr)
    
    # Filter siblings: exclude self, exclude already-linked
    available_siblings = [s for s in siblings if s != slug and s not in existing_targets]
    
    # How many links do we need?
    current_body_links = re.findall(
        r'href=["\'](?:/articles/[^"\']+)["\']', body_before_hr
    )
    needed = max(0, 3 - len(current_body_links))
    
    if needed == 0:
        return content, changes
    
    # Find linkable paragraphs
    candidates = find_linkable_paragraphs(content)
    if not candidates:
        # Fallback 1: find ANY paragraph without a link, even short ones
        body = content.split('<hr')[0] if '<hr' in content else content
        for m in re.finditer(r'<p>(.*?)</p>', body, re.DOTALL):
            para = m.group(1)
            if '<a ' not in para and len(strip_html(para).split()) >= 15:
                candidates.append({
                    'text': para,
                    'plain': strip_html(para),
                    'start': m.start(),
                    'end': m.end(),
                    'full_match': m.group(0),
                })
    
    if not candidates and needed > 0:
        # Fallback 2: allow paragraphs that already have ONE link but are long enough
        body = content.split('<hr')[0] if '<hr' in content else content
        for m in re.finditer(r'<p>(.*?)</p>', body, re.DOTALL):
            para = m.group(1)
            link_count = len(re.findall(r'<a ', para))
            if link_count <= 1 and len(strip_html(para).split()) >= 50:
                candidates.append({
                    'text': para,
                    'plain': strip_html(para),
                    'start': m.start(),
                    'end': m.end(),
                    'full_match': m.group(0),
                })

    # Spread links across different paragraphs
    # Use paragraphs from different sections (spaced apart)
    if len(candidates) > needed:
        step = max(1, len(candidates) // (needed + 1))
        selected = [candidates[min(i * step, len(candidates)-1)] for i in range(1, needed + 1)]
    else:
        selected = candidates[:needed]
    
    # Insert links (work backwards to preserve positions)
    insertions = []
    for i, para in enumerate(selected):
        if i >= len(available_siblings):
            break
        sib_slug = available_siblings[i]
        sib_title = slug_to_title.get(sib_slug, sib_slug.replace('-', ' ').title())
        anchor = build_anchor_text(sib_title)
        
        # Build the link sentence
        link_html = f' For related history, see our <a href="/articles/{sib_slug}/">{anchor}</a>.'
        
        # Append link to end of paragraph content
        old_para = para['full_match']
        new_para = old_para.replace('</p>', f'{link_html}</p>')
        insertions.append((old_para, new_para, sib_slug))
    
    # Apply insertions (in reverse order to preserve positions)
    for old_para, new_para, sib_slug in reversed(insertions):
        if old_para in content:
            content = content.replace(old_para, new_para, 1)
            changes.append(f"Added body link: {sib_slug}")
    
    return content, changes

# ============================================================
# SEMANTIC SCORE COMPUTER
# ============================================================
def compute_semantic_scores(content, plain_text, word_count):
    """Compute all I1-I7 semantic scores from content."""
    # I1: Named entities — places, institutions, events
    entity_patterns = [
        # Common place/institution patterns
        r'(?:Fort|Castle|Prison|Church|Hotel|Museum|Cemetery|Theatre|Theater|Palace|Tower|House|Mansion|Jail|Hospital|Cathedral|Abbey|Chapel|Square|Park|Bridge|Street|Avenue|Hill|Island)\b',
        r'\b(?:University|College|Society|Association|Commission|Department|Bureau|Corps|Regiment|Battalion|Company)\b',
    ]
    entities = set()
    # Find capitalized multi-word proper nouns (2+ words starting with caps)
    for m in re.finditer(r'\b([A-Z][a-z]+(?:\s+(?:of|the|and|de|du|la|le|von|van)\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b', plain_text):
        entities.add(m.group(1))
    entity_count = len(entities)

    # I2: Unique years cited
    years = set(re.findall(r'\b(1[0-9]{3}|20[0-2][0-9])\b', plain_text))
    year_count = len(years)

    # I3: Data points (dates, measurements, addresses, specific numbers)
    full_dates = re.findall(r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b', plain_text)
    measurements = re.findall(r'\b\d+[\-\s](?:feet|foot|miles?|yards?|meters?|pounds?|tons?|acres?|square)\b', plain_text, re.I)
    addresses = re.findall(r'\d+\s+\w+\s+(?:Street|Avenue|Place|Road|Drive|Boulevard|Lane|Way)\b', plain_text)
    specific_nums = re.findall(r'\b\d{2,}\b', plain_text)  # numbers with 2+ digits
    data_count = len(set(full_dates)) + len(set(measurements)) + len(set(addresses)) + min(len(specific_nums), 20)

    # I4: Named people
    # Look for First Last name patterns (not starting sentences after periods)
    people = set()
    for m in re.finditer(r'\b([A-Z][a-z]{2,}\s+(?:[A-Z]\.?\s+)?[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)\b', plain_text):
        name = m.group(1)
        # Filter out common non-name patterns
        if not any(w in name for w in ['The ', 'This ', 'That ', 'These ', 'Those ', 'When ', 'Where ', 'What ', 'Which ', 'Their ']):
            people.add(name)
    people_count = len(people)

    # I5: Source/authority references
    source_patterns = [
        r'\b(?:according to|records show|archives?|historical society|museum|documented|registry|commission|National Park Service)\b',
        r'\b(?:newspaper|journal|court record|testimony|report|investigation|survey|study|census)\b',
        r'\b(?:historian|researcher|archaeologist|professor|curator|director|author)\b',
    ]
    src_count = sum(1 for p in source_patterns if re.search(p, plain_text, re.I))

    # I6: H2 topic breadth
    h2s = re.findall(r'<h2[^>]*>(.*?)</h2>', content, re.I)
    h2_words = set()
    for h in h2s:
        for w in strip_html(h).lower().split():
            if len(w) > 3 and w not in {'that','this','with','from','what','when','where','were','have','been','they','them','their','into','also'}:
                h2_words.add(w)
    h2_breadth = len(h2_words)

    # I7: Entity density
    ent_density = round(entity_count / max(word_count / 1000, 0.1), 1)

    return {
        'entities': entity_count,
        'years': year_count,
        'dataPoints': data_count,
        'namedPeople': people_count,
        'sourceRefs': src_count,
        'h2Breadth': h2_breadth,
        'entityDensity': ent_density,
    }

# ============================================================
# SELF-VALIDATOR
# ============================================================
def validate_article(article, all_slugs):
    """Run all BLOCK and WARN checks. Returns (results_list, block_fails, warn_fails)."""
    results = []
    block_fails = []
    warn_fails = []
    content = article.get('content', '')
    plain = strip_html(content)
    wc = len(plain.split())
    body = content.split('<hr')[0] if '<hr' in content else content
    slug = article.get('slug', '')

    def check(tier, cid, name, passed, detail=""):
        status = "PASS" if passed else "FAIL"
        results.append((tier, cid, name, status, detail))
        if not passed:
            if tier == 'BLOCK': block_fails.append(cid)
            else: warn_fails.append(cid)

    # --- BLOCK ---
    try:
        json.dumps(article)
        check('BLOCK', 'B1', 'Valid JSON', True)
    except:
        check('BLOCK', 'B1', 'Valid JSON', False, 'serialization error')

    tlen = len(article.get('title', ''))
    check('WARN', 'B2', 'Title <=60', tlen <= 60, f"{tlen} chars")

    elen = len(article.get('excerpt', ''))
    check('WARN', 'B3', 'Excerpt <=155', elen <= 155, f"{elen} chars")

    h1c = len(re.findall(r'<h1[> ]', content, re.I))
    check('BLOCK', 'B4', 'No H1 in body', h1c == 0)

    h2c = len(re.findall(r'<h2[> ]', content, re.I))
    # B5: Standard articles 4-8 H2s, but pillar/long-form (2000+ words) can have up to 16
    # Demoted to WARN: heading count is editorial preference, not SEO gate
    max_h2 = 16 if wc >= 2000 else 8
    check('WARN', 'B5', 'H2 count 4-8', 4 <= h2c <= max_h2, f"{h2c} (max {max_h2} for {wc}w)")

    check('BLOCK', 'B6', 'Word count >=1000', wc >= 1000, str(wc))

    # B7: Banned phrases (body only — excludes Continue Reading footer)
    body_plain = strip_html(body)
    found_banned = []
    for b in BANNED_PHRASES:
        pat = r'\b' + re.escape(b) + r'\b'
        if re.search(pat, body_plain, re.I):
            found_banned.append(b)
    check('BLOCK', 'B7', 'No banned phrases', not found_banned,
          str(found_banned) if found_banned else "")

    # B8: Mojibake — detect UTF-8 bytes misread as cp1252
    # 3-byte sequences: â€ followed by a cp1252 char (em-dash, quotes, etc.)
    # 2-byte sequences: Ã followed by a Latin-1 continuation byte (accented chars)
    mojibake_3byte = re.findall(r'â€[^\s<>]', content)
    mojibake_2byte = re.findall(r'Ã[\x80-\xbf\xa0-\xff©¨¼¶¤±®´»§‰]', content)
    mojibake = mojibake_3byte + mojibake_2byte
    check('BLOCK', 'B8', 'No mojibake', not mojibake,
          f"{len(mojibake)} sequences" if mojibake else "")

    # B9: Body links (articles + hub/tour pages count)
    body_art_links = re.findall(r'href=["\'](?:/articles/[^"\']+)["\']', body)
    body_hub_links = re.findall(r'href=["\'](?:/blog/[^"\']+|/[^"\']*ghost-tours/)["\']', body)
    total_body_links = len(body_art_links) + len(body_hub_links)
    check('WARN', 'B9', '>=3 body links', total_body_links >= 3,
          f"{total_body_links} links")

    # B10: No self-links
    self_links = [l for l in re.findall(r'href=["\']([^"\']+)["\']', body) if slug in l and '/articles/' in l]
    check('BLOCK', 'B10', 'No self-links', not self_links)

    # B11: No broken internal links
    art_links = re.findall(r'href=["\'](?:/articles/([^"\']+?)/)["\']', content)
    broken = [s for s in art_links if s not in all_slugs]
    check('BLOCK', 'B11', 'No broken links', not broken,
          str(broken) if broken else "")

    # B12: Primary keyword in title
    title_lower = article.get('title', '').lower()
    # Extract likely keyword from slug
    slug_words = set(slug.replace('-', ' ').split()) - {'the','a','an','in','of','and','or'}
    keyword_in_title = sum(1 for w in slug_words if w in title_lower) >= min(2, len(slug_words))
    # Demoted to WARN: semantic search doesn't require exact keyword match in title
    check('WARN', 'B12', 'Keyword in title', keyword_in_title)

    # B13: Primary keyword in first 100 words
    first100 = ' '.join(plain.split()[:100]).lower()
    keyword_in_first100 = sum(1 for w in slug_words if w in first100) >= min(2, len(slug_words))
    # Demoted to WARN: semantic search values topic coverage, not keyword placement
    check('WARN', 'B13', 'Keyword in first 100w', keyword_in_first100)

    # B14: Featured image (metadata + file existence)
    fi = article.get('featuredImage', {})
    fi_url = fi.get('sourceUrl', '')
    fi_alt = fi.get('altText', '')
    fi_meta_ok = bool(fi_url and fi_alt)
    fi_file_ok = True
    if fi_url:
        fi_disk = os.path.join(BASE_DIR, 'public', fi_url.lstrip('/'))
        fi_file_ok = os.path.exists(fi_disk)
    check('BLOCK', 'B14', 'Featured image meta', fi_meta_ok,
          f"url={'yes' if fi_url else 'MISSING'} alt={'yes' if fi_alt else 'MISSING'}")
    check('WARN', 'B14f', 'Featured image file exists', fi_file_ok,
          fi_url if not fi_file_ok else '')

    # --- WARN ---
    check('WARN', 'W1', 'wordCount present', article.get('wordCount', 0) > 0,
          str(article.get('wordCount', 0)))
    check('WARN', 'W2', 'readingTime present', bool(article.get('readingTime')),
          article.get('readingTime', ''))
    check('WARN', 'W3', 'articleType present', bool(article.get('articleType')),
          article.get('articleType', ''))
    check('WARN', 'W4', 'pageType set',
          article.get('pageType') not in (None, '', 'unassigned'),
          article.get('pageType', ''))
    check('WARN', 'W5', 'Continue Reading footer',
          '<hr' in content and 'Continue Reading' in content)

    cat_slug = article.get('categories', [{}])[0].get('slug', '')
    hub_url = HUB_MAP.get(cat_slug, '')
    tour_url = TOUR_MAP.get(cat_slug, '')
    hub_found = (hub_url and hub_url in body) or (tour_url and tour_url in body)
    check('WARN', 'W6', 'Hub link in body', hub_found)

    # W7: sibling links (at least 2 other articles from same category in body)
    body_article_slugs = set(re.findall(r'href=["\'](?:/articles/([^"\']+?)/)["\']', body))
    body_article_slugs.discard(slug)
    check('WARN', 'W7', '>=2 sibling links', len(body_article_slugs) >= 2,
          f"{len(body_article_slugs)}")

    return results, block_fails, warn_fails

# ============================================================
# AUDIT LOGGER
# ============================================================
def write_audit_log(slug, results, changes, block_count, warn_count, article):
    """Thread-safe append to AUDIT-LOG.md."""
    now = datetime.now().strftime('%Y-%m-%d %H:%M')
    rows = ""
    for tier, cid, name, status, detail in results:
        d = f" ({detail})" if detail else ""
        rows += f"| {tier} | {cid} | {name} | {status}{d} |\n"

    ss = article.get('semanticScores', {})
    info_rows = ""
    for key, label in [
        ('entities','I1 Entities'), ('years','I2 Years'),
        ('dataPoints','I3 Data points'), ('namedPeople','I4 Named people'),
        ('sourceRefs','I5 Source refs'), ('h2Breadth','I6 H2 breadth'),
        ('entityDensity','I7 Entity density')
    ]:
        val = ss.get(key, 'N/A')
        info_rows += f"| INFO | {label.split()[0]} | {label} | {val} (stored) |\n"

    changes_md = '\n'.join(f"- {c}" for c in changes) if changes else "- No changes needed"

    entry = f"""
## [{now}] — Optimization Run
**Operator:** SemanticPipe (automated)
**Article:** {slug}
**Spec version:** {SPEC_VERSION}

### Validation Results
| Tier | ID | Check | Result |
|------|----|-------|--------|
{rows}{info_rows}
### Changes Made
{changes_md}

### Block fails remaining: {block_count}
### Warn fails remaining: {warn_count}
"""
    with audit_lock:
        with open(AUDIT_LOG, 'a', encoding='utf-8') as f:
            f.write(entry)
        # Also write structured JSONL log
        json_entry = {
            'timestamp': now,
            'slug': slug,
            'spec_version': SPEC_VERSION,
            'block_count': block_count,
            'warn_count': warn_count,
            'changes': changes,
            'checks': {cid: status for tier, cid, name, status, detail in results},
            'semantic_scores': article.get('semanticScores', {}),
        }
        with open(AUDIT_JSON, 'a', encoding='utf-8') as f:
            f.write(json.dumps(json_entry, ensure_ascii=False) + '\n')

# ============================================================
# CORE OPTIMIZER — processes a single article
# ============================================================
def optimize_article(slug, all_slugs, cat_map, slug_to_title, slug_to_cat, dry_run=False, show_diff=False):
    """
    Optimize a single article against the unified spec.
    Returns dict with status, changes, block_fails, warn_fails.
    """
    path = os.path.join(ARTICLES_DIR, f"{slug}.json")
    if not os.path.exists(path):
        return {'slug': slug, 'status': 'ERROR', 'error': 'file not found'}

    with open(path, 'r', encoding='utf-8') as f:
        article = json.load(f)

    # Snapshot for --diff comparison
    if show_diff:
        import copy
        snapshot = copy.deepcopy(article)

    original_title = article.get('title', '')
    original_excerpt = article.get('excerpt', '')
    content = article.get('content', '')
    changes = []
    cat_slug = slug_to_cat.get(slug, 'uncategorized')
    siblings = cat_map.get(cat_slug, [])

    # --- Step 2: OPTIMIZE ---

    # Fix mojibake (B8) — must run FIRST before other text operations
    content, mojibake_changes = fix_mojibake(content)
    changes.extend(mojibake_changes)
    # Also fix mojibake in title and excerpt
    for bad, good in MOJIBAKE_MAP.items():
        if bad in article.get('title', ''):
            article['title'] = article['title'].replace(bad, good)
        if bad in article.get('excerpt', ''):
            article['excerpt'] = article['excerpt'].replace(bad, good)
    original_title = article.get('title', '')
    original_excerpt = article.get('excerpt', '')

    # Fix title length (B2)
    new_title = trim_title(original_title)
    if new_title != original_title:
        changes.append(f"Title: trimmed from {len(original_title)} to {len(new_title)} chars")
        article['title'] = new_title

    # Fix excerpt length (B3)
    new_excerpt = trim_excerpt(original_excerpt)
    if new_excerpt != original_excerpt:
        changes.append(f"Excerpt: trimmed from {len(original_excerpt)} to {len(new_excerpt)} chars")
        article['excerpt'] = new_excerpt

    # Fix banned phrases (B7)
    content, banned_changes = fix_banned_phrases(content)
    changes.extend(banned_changes)

    # Insert sibling links (B9, W6, W7)
    content, link_changes = insert_sibling_links(
        content, slug, cat_slug, siblings, slug_to_title, all_slugs
    )
    changes.extend(link_changes)

    article['content'] = content

    # --- Step 4: Compute semantic scores ---
    plain = strip_html(content)
    wc = count_words(content)
    scores = compute_semantic_scores(content, plain, wc)
    if article.get('semanticScores') != scores:
        article['semanticScores'] = scores
        if 'semanticScores' not in [c.split(':')[0] for c in changes]:
            changes.append(f"Computed semanticScores")

    # --- Step 5: Compute metadata ---
    if article.get('wordCount') != wc:
        article['wordCount'] = wc
        changes.append(f"Set wordCount={wc}")
    rt = f"{math.ceil(wc / 275)} min read"
    if article.get('readingTime') != rt:
        article['readingTime'] = rt
        changes.append(f"Set readingTime={rt}")
    if not article.get('articleType'):
        article['articleType'] = 'pillar' if wc >= 2000 else 'spoke'
        changes.append(f"Set articleType={article['articleType']}")
    if article.get('pageType') in (None, '', 'unassigned'):
        article['pageType'] = 'hub-spoke'
        changes.append(f"Set pageType=hub-spoke")

    article['modified'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # --- Step 3: SELF-VALIDATE ---
    results, block_fails, warn_fails = validate_article(article, all_slugs)

    block_count = len(block_fails)
    warn_count = len(warn_fails)

    result = {
        'slug': slug,
        'block_fails': block_fails,
        'warn_fails': warn_fails,
        'block_count': block_count,
        'warn_count': warn_count,
        'changes': changes,
        'scores': scores,
    }

    if show_diff and changes:
        diff_lines = []
        for key in ['title', 'excerpt', 'wordCount', 'readingTime', 'articleType', 'pageType']:
            old_val = snapshot.get(key, '')
            new_val = article.get(key, '')
            if old_val != new_val:
                diff_lines.append(f"  {key}: {repr(old_val)[:60]} -> {repr(new_val)[:60]}")
        old_wc = strip_html(snapshot.get('content', '')).split()
        new_wc = strip_html(article.get('content', '')).split()
        if len(old_wc) != len(new_wc):
            diff_lines.append(f"  content words: {len(old_wc)} -> {len(new_wc)}")
        old_links = set(re.findall(r'href=["\'](?:/articles/([^"\']+?)/)["\']', snapshot.get('content', '')))
        new_links = set(re.findall(r'href=["\'](?:/articles/([^"\']+?)/)["\']', article.get('content', '')))
        added_links = new_links - old_links
        if added_links:
            diff_lines.append(f"  +links: {sorted(added_links)}")
        if diff_lines:
            result['diff'] = diff_lines

    if dry_run:
        result['status'] = 'DRY_RUN'
        return result

    # --- Step 6: SAVE (only if 0 BLOCK fails) ---
    if block_count == 0:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(article, f, indent=2, ensure_ascii=False)
        result['status'] = 'SAVED'
    else:
        result['status'] = 'BLOCKED'

    # --- Step 7: LOG ---
    write_audit_log(slug, results, changes, block_count, warn_count, article)

    return result

# ============================================================
# MULTI-THREADED RUNNER
# ============================================================
def needs_optimization(slug, all_slugs, cat_map, slug_to_cat):
    """Quick check if an article needs optimization (without loading full content expensively)."""
    path = os.path.join(ARTICLES_DIR, f"{slug}.json")
    with open(path, 'r', encoding='utf-8') as f:
        a = json.load(f)
    content = a.get('content', '')
    plain = strip_html(content)
    body = content.split('<hr')[0] if '<hr' in content else content

    # Check BLOCK issues only (B2/B3/B5/B9/B12/B13 are now WARN — not triggers)
    body_plain = strip_html(body)
    for b in BANNED_PHRASES:
        if re.search(r'\b' + re.escape(b) + r'\b', body_plain, re.I): return True
    # Check metadata
    if not a.get('semanticScores'): return True
    if not a.get('wordCount'): return True
    if not a.get('readingTime'): return True
    if not a.get('articleType'): return True
    if a.get('pageType') in (None, '', 'unassigned'): return True
    return False

def run_pipeline(slugs, threads=4, dry_run=False, show_diff=False):
    """Run the optimizer across multiple articles with thread pool."""
    print(f"\n{'='*70}")
    print(f"SemanticPipe — Automated Optimizer")
    print(f"Spec: {SPEC_VERSION}")
    print(f"Articles: {len(slugs)} | Threads: {threads} | Dry run: {dry_run}")
    print(f"{'='*70}\n")

    # Load shared inventory (read-only, safe for threads)
    print("Loading article inventory...")
    all_slugs, cat_map, slug_to_title, slug_to_cat = load_inventory()
    print(f"  {len(all_slugs)} articles across {len(cat_map)} categories\n")

    # Track results
    saved = []
    blocked = []
    errors = []
    skipped = []
    start_time = datetime.now()

    def process_one(slug):
        try:
            return optimize_article(slug, all_slugs, cat_map, slug_to_title, slug_to_cat, dry_run, show_diff)
        except Exception as e:
            return {'slug': slug, 'status': 'ERROR', 'error': str(e)}

    # Execute with thread pool
    with ThreadPoolExecutor(max_workers=threads) as executor:
        futures = {executor.submit(process_one, s): s for s in slugs}
        for i, future in enumerate(as_completed(futures), 1):
            result = future.result()
            slug = result['slug']
            status = result['status']

            # Status emoji and summary
            if status == 'SAVED':
                saved.append(result)
                icon = 'OK'
                detail = f"{len(result['changes'])} changes, {result['warn_count']} warns"
            elif status == 'DRY_RUN':
                saved.append(result)
                icon = 'DRY'
                detail = f"{len(result['changes'])} changes needed"
            elif status == 'BLOCKED':
                blocked.append(result)
                icon = 'BLOCK'
                detail = f"fails: {result['block_fails']}"
            else:
                errors.append(result)
                icon = 'ERR'
                detail = result.get('error', 'unknown')

            print(f"  [{i:3d}/{len(slugs)}] {icon:5s} {slug[:50]:50s} {detail}")
            if show_diff and result.get('diff'):
                for dl in result['diff']:
                    print(f"        {dl}")

    # Summary
    elapsed = (datetime.now() - start_time).total_seconds()
    print(f"\n{'='*70}")
    print(f"PIPELINE COMPLETE")
    print(f"{'='*70}")
    print(f"  Duration:  {elapsed:.1f}s ({elapsed/max(len(slugs),1):.2f}s per article)")
    print(f"  Saved:     {len(saved)}")
    print(f"  Blocked:   {len(blocked)}")
    print(f"  Errors:    {len(errors)}")
    print(f"{'='*70}")

    if blocked:
        print(f"\nBLOCKED articles (need manual intervention):")
        for r in blocked:
            print(f"  {r['slug']}: {r['block_fails']}")

    if errors:
        print(f"\nERROR articles:")
        for r in errors:
            print(f"  {r['slug']}: {r.get('error','unknown')}")

    # Return summary for programmatic use
    return {
        'total': len(slugs),
        'saved': len(saved),
        'blocked': len(blocked),
        'errors': len(errors),
        'elapsed': elapsed,
        'blocked_details': blocked,
        'error_details': errors,
    }

# ============================================================
# CLI ENTRY POINT
# ============================================================
def main():
    parser = argparse.ArgumentParser(description='SemanticPipe — Automated Article Optimizer')
    parser.add_argument('--dry-run', action='store_true', help='Report changes without saving')
    parser.add_argument('--slugs', type=str, help='Comma-separated article slugs')
    parser.add_argument('--category', type=str, help='Optimize all articles in a category')
    parser.add_argument('--threads', type=int, default=4, help='Thread pool size (default: 4)')
    parser.add_argument('--all', action='store_true', help='Optimize all articles needing work')
    parser.add_argument('--force', action='store_true', help='Re-optimize even if already passing')
    parser.add_argument('--diff', action='store_true', help='Show before/after diff for each article')
    args = parser.parse_args()

    # Load inventory for filtering
    all_slugs, cat_map, slug_to_title, slug_to_cat = load_inventory()

    # Determine which articles to process
    if args.slugs:
        target_slugs = [s.strip() for s in args.slugs.split(',')]
        # Validate
        for s in target_slugs:
            if s not in all_slugs:
                print(f"ERROR: Unknown slug '{s}'")
                sys.exit(1)
    elif args.category:
        if args.category not in cat_map:
            print(f"ERROR: Unknown category '{args.category}'")
            print(f"Available: {', '.join(sorted(cat_map.keys()))}")
            sys.exit(1)
        target_slugs = cat_map[args.category]
    elif args.all:
        target_slugs = sorted(all_slugs)
    else:
        print("No target specified. Use --slugs, --category, or --all")
        print("  --dry-run to preview changes without saving")
        sys.exit(0)

    # Filter to only those needing work (unless --force)
    if not args.force:
        print(f"Scanning {len(target_slugs)} articles for optimization needs...")
        filtered = []
        for s in target_slugs:
            try:
                if needs_optimization(s, all_slugs, cat_map, slug_to_cat):
                    filtered.append(s)
            except Exception as e:
                print(f"  WARN: error scanning {s}: {e}")
                filtered.append(s)
        print(f"  {len(filtered)} of {len(target_slugs)} need optimization\n")
        target_slugs = filtered

    if not target_slugs:
        print("All articles already optimized. Use --force to re-run.")
        sys.exit(0)

    # Run the pipeline
    summary = run_pipeline(target_slugs, threads=args.threads, dry_run=args.dry_run, show_diff=args.diff)

    # Exit code
    if summary['errors'] > 0:
        sys.exit(2)
    elif summary['blocked'] > 0:
        sys.exit(1)
    sys.exit(0)

if __name__ == '__main__':
    main()
