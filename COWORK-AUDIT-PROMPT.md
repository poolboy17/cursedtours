# SemanticPipe Audit — Cowork Instructions

## Context
You are auditing cursedtours.com articles after a multi-threaded semantic SEO optimization pass. The optimization was run by Cowork in a previous session but no execution log was created. We need to:

1. Determine if the optimization goals were met
2. Create a permanent record of findings

## Files you need
- **Spec:** `D:/dev/projects/cursedtours/SEO-OPTIMIZATION-SPEC.md` — defines every requirement and threshold
- **Audit script:** `D:/dev/projects/cursedtours/audit.py` — runs automated checks against the spec
- **Writer config:** `D:/dev/projects/cursedtours/docs/ARTICLE-WRITER-CONFIG.md` — content quality rules
- **Gap analysis:** `D:/dev/projects/cursedtours/PIPELINE-GAP-ANALYSIS.md` — known P0 bugs that should have been fixed

## Step 1: Read the spec
Read `SEO-OPTIMIZATION-SPEC.md` first. Every test you run is defined there.

## Step 2: Run the audit script
```
python D:/dev/projects/cursedtours/audit.py
```
This scans all article JSONs in `src/data/articles/` and checks structural requirements (S1-S14), linking requirements (L1-L5), and semantic depth signals (D1-D8) as defined in the spec.

It outputs:
- Console scorecard (paste this into the log)
- `D:/dev/projects/cursedtours/AUDIT-REPORT.md` (detailed per-article results)

## Step 3: Check P0 bugs from gap analysis
Read `PIPELINE-GAP-ANALYSIS.md` and verify whether these 4 P0 items are resolved:
1. og:image on article pages — check `src/pages/articles/[slug].astro` or equivalent template
2. Twitter card meta tags — check Layout component
3. Broken UTF-8 in 4 New Orleans articles (lalaurie-mansion, french-quarter, voodoo-complete-guide, st-louis-cemetery)
4. 11 Dracula articles linking to nonexistent `/destinations/draculas-castle/`

## Step 4: Write the audit log
Create or append to `D:/dev/projects/cursedtours/AUDIT-LOG.md` with this format:

```markdown
## [timestamp] — Post-Optimization Audit
**Operator:** Cowork
**Scope:** All articles in src/data/articles/
**Spec version:** SEO-OPTIMIZATION-SPEC.md v1.0

### Audit Script Results
[paste console scorecard here]

### P0 Bug Status
1. og:image: [FIXED/OPEN] — [evidence]
2. Twitter cards: [FIXED/OPEN] — [evidence]
3. UTF-8 encoding: [FIXED/OPEN] — [evidence]
4. Dracula hub links: [FIXED/OPEN] — [evidence]

### Summary
- Total articles: N
- Fully optimized (per spec): N
- Partially optimized: N
- Unoptimized: N
- Recently modified (≥2026-02-24): N

### Semantic Signal Health
- Articles meeting all D1-D8 thresholds: N/total
- Weakest signal across the corpus: [which one, what average]
- Thinnest 5 articles: [list slugs]

### Conclusion
[1-3 sentences: did the optimization pass meet the spec or not, and what remains]
```

## Rules
- Do NOT fix anything in this session. Audit only.
- Do NOT skip steps. Read the spec, run the script, check P0s, write the log.
- If the script errors, debug it and note what you fixed in the log.
- The AUDIT-LOG.md is the proof of work. It must be complete and honest.
