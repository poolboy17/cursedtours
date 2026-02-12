#!/usr/bin/env python3
"""SEO Quality Control Audit for CursedTours.com Astro build."""
import os, re, json, sys
from collections import defaultdict

dist = os.path.join(os.path.dirname(__file__), 'dist')
if not os.path.isdir(dist):
    print("ERROR: No dist/ directory found. Run `npx astro build` first.")
    sys.exit(1)

issues = defaultdict(list)
stats = defaultdict(lambda: {'pass': 0, 'warn': 0, 'fail': 0})

def extract(html, pattern, group=1):
    m = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
    return m.group(group).strip() if m else None

def extract_all(html, pattern):
    return re.findall(pattern, html, re.DOTALL | re.IGNORECASE)

def check(page, category, passed, msg):
    if passed:
        stats[category]['pass'] += 1
    else:
        level = 'FAIL' if 'FAIL' in msg or 'Missing' in msg else 'WARN'
        stats[category]['fail' if level == 'FAIL' else 'warn'] += 1
        issues[page].append(f"[{level}] {msg}")

def classify_page(path):
    """Classify page type. Order matters — more specific paths first."""
    if path == '/':
        return 'homepage'
    if path.startswith('/articles/category/'):
        return 'category'
    if path.startswith('/articles/') and path != '/articles/':
        return 'article'
    if path.startswith('/destinations/') and path != '/destinations/':
        return 'destination'
    if path.startswith('/experiences/') and path != '/experiences/':
        return 'experience'
    if '-ghost-tours/' in path:
        return 'city-hub'
    return 'utility'

def get_schemas(html):
    schemas = extract_all(html, r'<script\s+type="application/ld\+json"[^>]*>([^<]+)</script>')
    types = []
    for s in schemas:
        try:
            d = json.loads(s)
            types.append(d.get('@type', 'unknown'))
        except:
            pass
    return types

def validate_page(filepath, html):
    rel = filepath[len(dist):]
    if rel.endswith('/index.html'):
        rel = rel[:-len('index.html')]
    if not rel:
        rel = '/'

    page_type = classify_page(rel)
    schema_types = get_schemas(html)
    text_only = re.sub(r'<[^>]+>', ' ', html)
    word_count = len(re.sub(r'\s+', ' ', text_only).split())
    internal_links = len(re.findall(r'href="\/[^"]*"', html))
    h1s = extract_all(html, r'<h1[^>]*>([^<]+)</h1>')
    h2s = extract_all(html, r'<h2[^>]*>([^<]+)</h2>')

    # === UNIVERSAL CHECKS ===
    title = extract(html, r'<title>([^<]+)</title>')
    check(rel, page_type, title and len(title) > 10, f"Missing or short <title>")
    check(rel, page_type, title and len(title) <= 65, f"WARN: Title too long ({len(title) if title else 0} chars)")
    check(rel, page_type, title and 'Cursed Tours' in (title or ''), f"WARN: Title missing brand")

    desc = extract(html, r'<meta\s+name="description"\s+content="([^"]*)"')
    check(rel, page_type, desc and len(desc) > 50, f"Missing or short meta description")
    check(rel, page_type, desc and len(desc) <= 160, f"WARN: Meta description too long ({len(desc) if desc else 0} chars)")

    canonical = extract(html, r'<link\s+rel="canonical"\s+href="([^"]*)"')
    check(rel, page_type, canonical, f"FAIL: Missing canonical URL")
    check(rel, page_type, canonical and 'cursedtours.com' in (canonical or ''), f"FAIL: Canonical not cursedtours.com")

    check(rel, page_type, len(h1s) == 1, f"{'FAIL: No H1' if len(h1s) == 0 else f'WARN: {len(h1s)} H1 tags'}")
    og_title = extract(html, r'<meta\s+property="og:title"\s+content="([^"]*)"')
    check(rel, page_type, og_title, f"WARN: Missing og:title")

    # === PAGE-TYPE SPECIFIC ===
    if page_type == 'city-hub':
        check(rel, page_type, word_count >= 800, f"FAIL: Too thin ({word_count}w, need 800+)")
        check(rel, page_type, len(h2s) >= 3, f"WARN: Need more H2s ({len(h2s)})")
        check(rel, page_type, 'FAQPage' in schema_types, f"FAIL: Missing FAQPage JSON-LD")
        check(rel, page_type, internal_links >= 5, f"WARN: Low internal links ({internal_links})")
        check(rel, page_type, bool(re.search(r'Frequently Asked|FAQ', html, re.I)), f"WARN: No FAQ section")
        check(rel, page_type, bool(re.search(r'Home.*/', html, re.I)), f"WARN: No breadcrumbs")

    elif page_type == 'article':
        check(rel, page_type, word_count >= 500, f"FAIL: Too thin ({word_count}w)")
        check(rel, page_type, 'Article' in schema_types, f"FAIL: Missing Article JSON-LD")
        check(rel, page_type, 'BreadcrumbList' in schema_types, f"WARN: Missing BreadcrumbList")
        check(rel, page_type, bool(re.search(r'<time\s+datetime', html)), f"WARN: No <time> tag")
        check(rel, page_type, bool(re.search(r'Related Articles', html)), f"WARN: No related articles")
        check(rel, page_type, bool(re.search(r'min read', html)), f"WARN: No read time")

    elif page_type == 'destination':
        check(rel, page_type, 'FAQPage' in schema_types, f"FAIL: Missing FAQPage JSON-LD")
        check(rel, page_type, 'TouristAttraction' in schema_types, f"FAIL: Missing TouristAttraction")
        check(rel, page_type, 'BreadcrumbList' in schema_types, f"WARN: Missing BreadcrumbList")
        check(rel, page_type, len(re.findall(r'viator\.com', html)) >= 1, f"WARN: No Viator links")
        check(rel, page_type, bool(re.search(r'Frequently Asked|FAQ', html, re.I)), f"WARN: No FAQ section")

    elif page_type == 'category':
        check(rel, page_type, len(h2s) >= 1, f"WARN: Need H2")
        check(rel, page_type, len(re.findall(r'href="/articles/[^"]+/"', html)) >= 3, f"WARN: Few article links")

    elif page_type == 'experience':
        check(rel, page_type, word_count >= 400, f"WARN: Thin ({word_count}w)")
        check(rel, page_type, len(h2s) >= 2, f"WARN: Need more H2s")

    elif page_type == 'homepage':
        check(rel, page_type, internal_links >= 10, f"WARN: Low internal links ({internal_links})")
        check(rel, page_type, word_count >= 300, f"WARN: Thin ({word_count}w)")

    return page_type

# === RUN ===
type_counts = defaultdict(int)
for root, dirs, files in os.walk(dist):
    for f in files:
        if not f.endswith('.html'):
            continue
        filepath = os.path.join(root, f)
        with open(filepath, 'r', errors='ignore') as fh:
            html = fh.read()
        pt = validate_page(filepath, html)
        type_counts[pt] += 1

# === REPORT ===
print()
print("=" * 60)
print("  SEO QUALITY CONTROL AUDIT — CursedTours.com")
print("=" * 60)
print()
print(f"  {'Page Type':<15} {'Pages':>5}  {'Pass':>5}  {'Warn':>5}  {'Fail':>5}  {'Grade':>6}")
print("  " + "-" * 53)

total_pass = total_warn = total_fail = 0
for pt in ['city-hub', 'article', 'destination', 'category', 'experience', 'homepage', 'utility']:
    s = stats[pt]
    total = s['pass'] + s['warn'] + s['fail']
    if total == 0:
        continue
    pct = (s['pass'] / total * 100) if total else 0
    grade = 'A' if pct >= 95 else 'B' if pct >= 85 else 'C' if pct >= 70 else 'D' if pct >= 50 else 'F'
    print(f"  {pt:<15} {type_counts[pt]:>5}  {s['pass']:>5}  {s['warn']:>5}  {s['fail']:>5}  {grade:>5} ({pct:.0f}%)")
    total_pass += s['pass']
    total_warn += s['warn']
    total_fail += s['fail']

total_all = total_pass + total_warn + total_fail
overall_pct = (total_pass / total_all * 100) if total_all else 0
overall_grade = 'A' if overall_pct >= 95 else 'B' if overall_pct >= 85 else 'C' if overall_pct >= 70 else 'D'
print("  " + "-" * 53)
print(f"  {'TOTAL':<15} {sum(type_counts.values()):>5}  {total_pass:>5}  {total_warn:>5}  {total_fail:>5}  {overall_grade:>5} ({overall_pct:.0f}%)")

fails = {p: [i for i in items if '[FAIL]' in i] for p, items in issues.items()}
fails = {p: i for p, i in fails.items() if i}
warns = {p: [i for i in items if '[WARN]' in i] for p, items in issues.items()}
warns = {p: i for p, i in warns.items() if i}

if fails:
    print()
    print(f"  FAILURES ({sum(len(v) for v in fails.values())}):")
    for page, items in sorted(fails.items()):
        for item in items:
            print(f"    {page:<48} {item}")

if warns and '--verbose' in sys.argv:
    print()
    print(f"  WARNINGS ({sum(len(v) for v in warns.values())}):")
    for page, items in sorted(warns.items()):
        for item in items:
            print(f"    {page:<48} {item}")
elif warns:
    print()
    print(f"  {sum(len(v) for v in warns.values())} warnings (run with --verbose to see details)")

print()
