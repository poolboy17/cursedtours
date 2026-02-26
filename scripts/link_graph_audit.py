#!/usr/bin/env python3
"""
link_graph_audit.py — Internal Link Graph Analyzer
====================================================
Scans all 171 articles and builds a directed graph of internal links.
Reports orphan articles, link islands, hub coverage, and graph health.

Usage:
    python link_graph_audit.py              # full report
    python link_graph_audit.py --orphans    # only show orphans
    python link_graph_audit.py --json       # output as JSON
"""
import json, re, os, sys, argparse
from collections import defaultdict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ARTICLES_DIR = BASE_DIR / "src" / "data" / "articles"
def strip_html(html):
    return re.sub(r'<[^>]+>', '', html)

def load_graph():
    """Build directed graph: slug -> set of linked slugs."""
    outbound = defaultdict(set)   # slug -> {linked slugs}
    inbound = defaultdict(set)    # slug -> {slugs linking TO it}
    articles = {}                 # slug -> article metadata
    all_slugs = set()

    for f in sorted(ARTICLES_DIR.glob('*.json')):
        slug = f.stem
        all_slugs.add(slug)
        with open(f, 'r', encoding='utf-8') as fh:
            a = json.load(fh)
        articles[slug] = {
            'title': a.get('title', ''),
            'category': a.get('categories', [{}])[0].get('slug', 'uncategorized'),
            'wordCount': a.get('wordCount', 0),
        }
        content = a.get('content', '')
        body = content.split('<hr')[0] if '<hr' in content else content        # Extract article links from body
        linked = set(re.findall(r'href=["\'](?:/articles/([^"\']+?)/)["\']', body))
        linked.discard(slug)  # remove self-links
        outbound[slug] = linked
        for target in linked:
            inbound[target].add(slug)

    return all_slugs, outbound, inbound, articles

def analyze(all_slugs, outbound, inbound, articles):
    """Run all link graph analyses. Returns report dict."""
    report = {}

    # 1. Orphan articles (no inbound links from other articles)
    orphans = sorted([s for s in all_slugs if not inbound.get(s)])
    report['orphans'] = orphans
    report['orphan_count'] = len(orphans)

    # 2. Dead-end articles (no outbound links)
    dead_ends = sorted([s for s in all_slugs if not outbound.get(s)])
    report['dead_ends'] = dead_ends
    report['dead_end_count'] = len(dead_ends)
    # 3. Broken links (link targets that don't exist as articles)
    broken = {}
    for slug, targets in outbound.items():
        missing = targets - all_slugs
        if missing:
            broken[slug] = sorted(missing)
    report['broken_links'] = broken

    # 4. Category coverage (links within vs across categories)
    cat_internal = defaultdict(int)
    cat_cross = defaultdict(int)
    for slug, targets in outbound.items():
        src_cat = articles[slug]['category']
        for t in targets:
            if t in articles:
                if articles[t]['category'] == src_cat:
                    cat_internal[src_cat] += 1
                else:
                    cat_cross[src_cat] += 1
    report['category_internal_links'] = dict(cat_internal)
    report['category_cross_links'] = dict(cat_cross)
    # 5. Graph stats
    total_links = sum(len(v) for v in outbound.values())
    avg_outbound = total_links / max(len(all_slugs), 1)
    avg_inbound = total_links / max(len(all_slugs), 1)
    max_outbound_slug = max(outbound, key=lambda s: len(outbound[s]), default='')
    max_inbound_slug = max(inbound, key=lambda s: len(inbound[s]), default='')
    report['stats'] = {
        'total_articles': len(all_slugs),
        'total_links': total_links,
        'avg_outbound': round(avg_outbound, 1),
        'avg_inbound': round(avg_inbound, 1),
        'max_outbound': f"{max_outbound_slug} ({len(outbound.get(max_outbound_slug, set()))})",
        'max_inbound': f"{max_inbound_slug} ({len(inbound.get(max_inbound_slug, set()))})",
    }

    # 6. Health score (0-100)
    orphan_penalty = min(30, len(orphans) * 2)
    dead_end_penalty = min(20, len(dead_ends) * 2)
    broken_penalty = min(20, sum(len(v) for v in broken.values()) * 5)
    link_density_bonus = min(30, int(avg_outbound * 10))
    health = max(0, 100 - orphan_penalty - dead_end_penalty - broken_penalty + link_density_bonus)
    report['health_score'] = min(100, health)

    return report
def print_report(report):
    """Pretty-print the link graph report."""
    s = report['stats']
    print(f"\n{'='*65}")
    print(f"  LINK GRAPH AUDIT")
    print(f"{'='*65}")
    print(f"  Articles:        {s['total_articles']}")
    print(f"  Total links:     {s['total_links']}")
    print(f"  Avg outbound:    {s['avg_outbound']} per article")
    print(f"  Avg inbound:     {s['avg_inbound']} per article")
    print(f"  Most outbound:   {s['max_outbound']}")
    print(f"  Most inbound:    {s['max_inbound']}")
    print(f"  Health score:    {report['health_score']}/100")
    print(f"{'='*65}")

    if report['orphans']:
        print(f"\n  ORPHANS ({report['orphan_count']} articles with 0 inbound links):")
        for o in report['orphans']:
            print(f"    - {o}")

    if report['dead_ends']:
        print(f"\n  DEAD ENDS ({report['dead_end_count']} articles with 0 outbound links):")
        for d in report['dead_ends']:
            print(f"    - {d}")

    if report['broken_links']:
        print(f"\n  BROKEN LINKS:")
        for slug, targets in report['broken_links'].items():
            print(f"    {slug} -> {targets}")

    print(f"\n  CATEGORY LINK DENSITY:")
    cats = sorted(set(list(report['category_internal_links'].keys()) +
                      list(report['category_cross_links'].keys())))
    for cat in cats:
        internal = report['category_internal_links'].get(cat, 0)
        cross = report['category_cross_links'].get(cat, 0)
        print(f"    {cat:45s} internal={internal:3d}  cross={cross:3d}")
    print(f"{'='*65}\n")
def main():
    parser = argparse.ArgumentParser(description='Internal link graph analyzer')
    parser.add_argument('--orphans', action='store_true', help='Only show orphan articles')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    args = parser.parse_args()

    all_slugs, outbound, inbound, articles = load_graph()
    report = analyze(all_slugs, outbound, inbound, articles)

    if args.json:
        # Convert sets to lists for JSON serialization
        json_report = {
            'orphans': report['orphans'],
            'dead_ends': report['dead_ends'],
            'broken_links': report['broken_links'],
            'stats': report['stats'],
            'health_score': report['health_score'],
        }
        print(json.dumps(json_report, indent=2))
    elif args.orphans:
        if report['orphans']:
            print(f"{report['orphan_count']} orphan articles:")
            for o in report['orphans']:
                print(f"  {o}")
        else:
            print("No orphan articles found.")
    else:
        print_report(report)

    # Exit code: 0 if healthy, 1 if issues found
    sys.exit(0 if report['health_score'] >= 70 else 1)

if __name__ == '__main__':
    main()
