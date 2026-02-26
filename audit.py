"""
SemanticPipe Audit Script v1.1
Run: python D:/dev/projects/cursedtours/audit.py
Output: console scorecard + D:/dev/projects/cursedtours/AUDIT-REPORT.md

LAYER 1 — Structural: field presence, linking, formatting
LAYER 2 — Semantic signals: entity density, data points, source refs, heading breadth
Google decides quality. We measure what we can.
"""

import json
import os
import re
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from collections import Counter

ARTICLES_DIR = Path(r"D:\dev\projects\cursedtours\src\data\articles")
REPORT_PATH = Path(r"D:\dev\projects\cursedtours\AUDIT-REPORT.md")

BANNED_PHRASES = [
    "journey", "unlock", "game-changer", "dive in", "explore the depths",
    "delve", "realm", "furthermore", "in conclusion", "nestled",
    "it's important to note", "in today's world", "it should be noted",
    "needless to say", "as we all know", "without further ado",
    "spine-tingling", "bone-chilling", "hair-raising", "reportedly haunted"
]
MOJIBAKE = ["Ã©", "Ã¨", "Ã¢", "\u00e2\u0080\u0099", "\u00e2\u0080\u009c", "\u00e2\u0080\u0094"]


# --- Helpers ---

class HTMLText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_data(self, d):
        self.parts.append(d)
    def get(self):
        return " ".join(self.parts)

def strip_html(h):
    p = HTMLText(); p.feed(h); return p.get()

def count_tag(content, tag):
    return len(re.findall(rf"<{tag}[^>]*>", content))

def get_h2_texts(content):
    return re.findall(r"<h2[^>]*>(.*?)</h2>", content, re.DOTALL)

def get_links(content, before_hr=False):
    src = content.split("<hr")[0] if before_hr else content
    return re.findall(r'href="(/[^"]*)"', src)

def has_continue_reading(c):
    return "Continue Reading" in c


# --- Semantic signal extractors ---

def count_years(text):
    """Count 4-digit year mentions (1400-2030)."""
    return len(set(re.findall(r'\b(1[4-9]\d{2}|20[0-2]\d)\b', text)))

def count_numbers(text):
    """Count specific numeric data points (not years). Dollars, percents, measurements."""
    dollars = re.findall(r'\$[\d,]+', text)
    percents = re.findall(r'\d+\s*%', text)
    measurements = re.findall(r'\b\d+[\d,]*\s*(?:feet|ft|miles|km|meters|pounds|lbs|acres|tons|gallons|hours|minutes|days|months|years old|people|prisoners|soldiers|victims|deaths|executions|arrests)\b', text, re.I)
    plain_numbers = re.findall(r'\b\d{2,6}\b', text)
    # Deduplicate roughly
    return len(dollars) + len(percents) + len(measurements) + max(0, len(plain_numbers) - len(dollars) - len(percents) - len(measurements))

def count_named_entities(text):
    """Heuristic: count capitalized multi-word phrases (likely proper nouns).
    Not NLP-grade but catches 'Salem Village', 'Governor William Phips', etc."""
    # Match 2-5 consecutive capitalized words (not at sentence start after period)
    caps = re.findall(r'(?<![.!?]\s)(?<!\A)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})', text)
    # Filter out common false positives
    stoppers = {"Continue Reading", "Explore The", "Read More"}
    return len([c for c in set(caps) if c not in stoppers])

def count_source_references(text):
    """Count mentions of primary sources: books, archives, records, newspapers, studies."""
    patterns = [
        r'\b(?:according to|cited in|published in|recorded in|documented in)\b',
        r'\b(?:court records?|trial records?|archives?|manuscript|testimony|deposition)\b',
        r'\b(?:newspaper|journal|gazette|chronicle|report(?:ed)?)\b',
        r'\b(?:historian|researcher|scholar|professor|archaeologist|author)\b',
        r'\b(?:memoir|autobiography|biography|diary|letter)\b',
    ]
    total = 0
    for p in patterns:
        total += len(re.findall(p, text, re.I))
    return total

def heading_breadth(h2_texts):
    """How diverse are the H2 topics? Count unique content words across headings."""
    stop = {"the","a","an","of","in","to","and","for","on","at","by","from","with","is","was","are","were","how","why","what","who","its","this","that"}
    words = []
    for h in h2_texts:
        clean = strip_html(h).lower()
        words.extend([w for w in re.findall(r'[a-z]+', clean) if w not in stop and len(w) > 2])
    return len(set(words))


# --- Per-article audit ---

def audit(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    slug = data.get("slug", "")
    content = data.get("content", "")
    plain = strip_html(content)
    words = plain.split()
    wc = len(words)
    r = {"slug": slug, "modified": data.get("modified",""), "wc_actual": wc,
         "passes": [], "fails": [], "warnings": [], "semantic": {}}

    # --- LAYER 1: Structural ---
    title = data.get("title","")
    excerpt = data.get("excerpt","")

    # Field checks
    if len(title) <= 60: r["passes"].append("title_len")
    else: r["fails"].append(f"title_len:{len(title)}")

    if len(excerpt) <= 155: r["passes"].append("excerpt_len")
    else: r["fails"].append(f"excerpt_len:{len(excerpt)}")

    if data.get("wordCount",0) > 0: r["passes"].append("wordCount")
    else: r["fails"].append("wordCount_missing")

    if data.get("readingTime"): r["passes"].append("readingTime")
    else: r["fails"].append("readingTime_missing")

    if data.get("articleType"): r["passes"].append("articleType")
    else: r["warnings"].append("articleType_missing")

    pt = data.get("pageType","")
    if pt and pt != "unassigned": r["passes"].append("pageType")
    else: r["warnings"].append(f"pageType:{pt or 'missing'}")


    # Structure
    h2s = count_tag(content, "h2")
    if 4 <= h2s <= 8: r["passes"].append(f"h2s:{h2s}")
    elif h2s > 0: r["warnings"].append(f"h2s:{h2s}")
    else: r["fails"].append("h2s:0")

    if not count_tag(content, "h1"): r["passes"].append("no_h1")
    else: r["fails"].append("h1_in_body")

    if has_continue_reading(content): r["passes"].append("footer")
    else: r["fails"].append("no_footer")

    # Links
    body_links = get_links(content, before_hr=True)
    hub_links = [l for l in body_links if l.startswith("/blog/")]

    if len(body_links) >= 3: r["passes"].append(f"links:{len(body_links)}")
    else: r["fails"].append(f"links:{len(body_links)}")

    if hub_links: r["passes"].append("hub_link")
    else: r["fails"].append("no_hub_link")

    # Quality
    banned = [p for p in BANNED_PHRASES if p.lower() in plain.lower()]
    if not banned: r["passes"].append("no_banned")
    else: r["fails"].append(f"banned:{banned}")

    moji = [m for m in MOJIBAKE if m in content]
    if not moji: r["passes"].append("no_mojibake")
    else: r["fails"].append(f"mojibake:{moji}")

    if wc >= 1000: r["passes"].append(f"wc:{wc}")
    elif wc >= 500: r["warnings"].append(f"wc_low:{wc}")
    else: r["fails"].append(f"wc_thin:{wc}")


    # --- LAYER 2: Semantic signals ---
    h2_texts = get_h2_texts(content)
    years = count_years(plain)
    nums = count_numbers(plain)
    entities = count_named_entities(plain)
    sources = count_source_references(plain)
    breadth = heading_breadth(h2_texts)
    per_k = lambda v: round(v / max(wc,1) * 1000, 1)

    sem = {
        "years": years,
        "data_points": nums,
        "named_entities": entities,
        "source_refs": sources,
        "h2_breadth": breadth,
        "entities_per_1k": per_k(entities),
        "data_per_1k": per_k(nums),
    }
    r["semantic"] = sem

    # Semantic thresholds (flags, not hard fails)
    if entities >= 5: r["passes"].append(f"entities:{entities}")
    else: r["warnings"].append(f"entities_low:{entities}")

    if years >= 3: r["passes"].append(f"years:{years}")
    else: r["warnings"].append(f"years_low:{years}")

    if sources >= 1: r["passes"].append(f"sources:{sources}")
    else: r["warnings"].append("no_source_refs")

    if breadth >= 8: r["passes"].append(f"breadth:{breadth}")
    else: r["warnings"].append(f"breadth_low:{breadth}")

    return r


# --- Cross-link validation ---

def validate_links(results):
    slugs = {fp.stem for fp in ARTICLES_DIR.glob("*.json")}
    urls = {f"/articles/{s}/" for s in slugs}
    broken = {}
    for r in results:
        with open(ARTICLES_DIR / f"{r['slug']}.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        links = [l for l in get_links(data.get("content","")) if l.startswith("/articles/")]
        bad = [l for l in links if l not in urls]
        if bad:
            broken[r["slug"]] = bad
    return broken


# --- Main ---

def main():
    articles = sorted(ARTICLES_DIR.glob("*.json"))
    total = len(articles)
    print(f"\n{'='*60}")
    print(f"  SemanticPipe Audit v1.1 — {total} articles")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*60}\n")

    results = []
    for fp in articles:
        try:
            results.append(audit(fp))
        except Exception as e:
            print(f"  ERROR: {fp.name} — {e}")


    perfect = [r for r in results if not r["fails"]]
    failing = [r for r in results if r["fails"]]
    recent = [r for r in results if r["modified"] >= "2026-02-24"]
    broken = validate_links(results)

    # Structural dimension counts
    def dim(key):
        return sum(1 for r in results if any(p.startswith(key) for p in r["passes"]))

    # Semantic aggregates
    sem_keys = ["years","data_points","named_entities","source_refs","h2_breadth","entities_per_1k","data_per_1k"]
    sem_avgs = {}
    for k in sem_keys:
        vals = [r["semantic"][k] for r in results]
        sem_avgs[k] = round(sum(vals)/len(vals), 1) if vals else 0

    # --- Console scorecard ---
    print("STRUCTURAL SCORECARD")
    print("-" * 50)
    print(f"  Articles:              {total}")
    print(f"  Perfect (0 fails):     {len(perfect)}/{total}")
    print(f"  Recently modified:     {len(recent)} (since 2026-02-24)")
    print(f"  Broken cross-links:    {len(broken)} articles")
    print()
    print(f"  title ≤60:             {dim('title_len')}/{total}")
    print(f"  excerpt ≤155:          {dim('excerpt_len')}/{total}")
    print(f"  wordCount present:     {dim('wordCount')}/{total}")
    print(f"  readingTime present:   {dim('readingTime')}/{total}")
    print(f"  H2s 4-8:              {dim('h2s')}/{total}")
    print(f"  No H1 in body:         {dim('no_h1')}/{total}")
    print(f"  Continue Reading:      {dim('footer')}/{total}")
    print(f"  ≥3 body links:         {dim('links')}/{total}")
    print(f"  Hub link present:      {dim('hub_link')}/{total}")
    print(f"  No banned phrases:     {dim('no_banned')}/{total}")
    print(f"  No mojibake:           {dim('no_mojibake')}/{total}")
    print(f"  Word count ≥1000:      {dim('wc')}/{total}")


    print()
    print("SEMANTIC SIGNALS (averages across all articles)")
    print("-" * 50)
    print(f"  Unique years cited:    {sem_avgs['years']} avg")
    print(f"  Data points:           {sem_avgs['data_points']} avg")
    print(f"  Named entities:        {sem_avgs['named_entities']} avg")
    print(f"  Entities per 1k words: {sem_avgs['entities_per_1k']} avg")
    print(f"  Source references:     {sem_avgs['source_refs']} avg")
    print(f"  H2 topic breadth:      {sem_avgs['h2_breadth']} avg unique terms")
    print()
    print(f"  Entities ≥5:           {dim('entities')}/{total}")
    print(f"  Years ≥3:              {dim('years')}/{total}")
    print(f"  Source refs ≥1:        {dim('sources')}/{total}")
    print(f"  H2 breadth ≥8:         {dim('breadth')}/{total}")


    # --- Write report ---
    L = []
    L.append("# SemanticPipe Audit Report v1.1")
    L.append(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}  ")
    L.append(f"**Articles:** {total} | **Perfect:** {len(perfect)} | **Failing:** {len(failing)}  ")
    L.append(f"**Recently modified (≥2026-02-24):** {len(recent)}  ")
    L.append(f"**Broken cross-links:** {len(broken)} articles")
    L.append("")

    # Structural table
    L.append("## Structural Pass Rates")
    L.append("")
    L.append("| Check | Pass | Total | Rate |")
    L.append("|-------|------|-------|------|")
    checks = [
        ("title ≤60", "title_len"), ("excerpt ≤155", "excerpt_len"),
        ("wordCount", "wordCount"), ("readingTime", "readingTime"),
        ("H2s 4-8", "h2s"), ("No H1", "no_h1"), ("Footer", "footer"),
        ("≥3 body links", "links"), ("Hub link", "hub_link"),
        ("No banned", "no_banned"), ("No mojibake", "no_mojibake"),
        ("WC ≥1000", "wc"),
    ]
    for label, key in checks:
        n = dim(key)
        L.append(f"| {label} | {n} | {total} | {n*100//total}% |")

    # Semantic table
    L.append("")
    L.append("## Semantic Signal Averages")
    L.append("")
    L.append("| Signal | Average | Threshold | Pass Rate |")
    L.append("|--------|---------|-----------|-----------|")
    sem_checks = [
        ("Named entities", "named_entities", "entities", "≥5"),
        ("Unique years", "years", "years", "≥3"),
        ("Source references", "source_refs", "sources", "≥1"),
        ("H2 breadth", "h2_breadth", "breadth", "≥8 terms"),
    ]
    for label, avg_key, pass_key, thresh in sem_checks:
        n = dim(pass_key)
        L.append(f"| {label} | {sem_avgs[avg_key]} | {thresh} | {n}/{total} ({n*100//total}%) |")

    L.append(f"| Data points | {sem_avgs['data_points']} | info only | — |")
    L.append(f"| Entities/1k words | {sem_avgs['entities_per_1k']} | info only | — |")


    # Recently modified
    L.append("")
    L.append("## Recently Modified (≥2026-02-24)")
    L.append("")
    if recent:
        for r in sorted(recent, key=lambda x: x["modified"], reverse=True):
            L.append(f"- `{r['slug']}` — modified {r['modified']}")
    else:
        L.append("_None found._")

    # Broken links
    L.append("")
    L.append("## Broken Internal Links")
    L.append("")
    if broken:
        for slug, bads in sorted(broken.items()):
            L.append(f"- **{slug}**: {', '.join(bads)}")
    else:
        L.append("_All article cross-links resolve._")

    # Failures detail
    L.append("")
    L.append("## Articles with Failures")
    L.append("")
    for r in sorted(failing, key=lambda x: len(x["fails"]), reverse=True):
        L.append(f"### `{r['slug']}` — {len(r['fails'])} fails")
        for f in r["fails"]:
            L.append(f"- ❌ {f}")
        for w in r["warnings"]:
            L.append(f"- ⚠️ {w}")
        L.append("")

    # Bottom 10 by semantic signals (thinnest articles)
    L.append("## Thinnest Articles (lowest entity + source counts)")
    L.append("")
    L.append("| Article | Entities | Years | Sources | WC |")
    L.append("|---------|----------|-------|---------|----|")
    ranked = sorted(results, key=lambda x: x["semantic"]["named_entities"] + x["semantic"]["source_refs"])
    for r in ranked[:10]:
        s = r["semantic"]
        L.append(f"| {r['slug']} | {s['named_entities']} | {s['years']} | {s['source_refs']} | {r['wc_actual']} |")

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(L))

    print()
    print(f"Report: {REPORT_PATH}")
    print()


if __name__ == "__main__":
    main()
