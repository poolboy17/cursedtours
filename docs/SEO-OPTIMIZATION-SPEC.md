# SemanticPipe — SEO Optimization Spec
# Version: 1.0 | Created: 2026-02-25
#
# This is the single source of truth for what "optimized" means.
# The audit script tests against these criteria.
# Cowork logs its work against these criteria.
# Google decides if we got it right.

---

# 1. PURPOSE

This spec defines the measurable requirements an article must meet
to be considered "SEO-optimized" under the SemanticPipe pipeline.

Every article on cursedtours.com (and future v2 sites) should be
evaluated against these criteria after any optimization pass.

---

# 2. STRUCTURAL REQUIREMENTS (hard pass/fail)

These are non-negotiable. Every article must pass all of these.

| # | Requirement | Test | Threshold |
|---|------------|------|-----------|
| S1 | Valid JSON | Parses without error | — |
| S2 | Title length | Character count | ≤60 |
| S3 | Excerpt length | Character count | ≤155 |
| S4 | wordCount field | Present and >0 | >0 |
| S5 | readingTime field | Present and non-empty | non-empty |
| S6 | articleType field | Present | spoke/pillar/long-form |
| S7 | pageType field | Present, not "unassigned" for clustered | hub-spoke preferred |
| S8 | H2 heading count | Count `<h2>` tags | 4–8 |
| S9 | No H1 in body | Absence of `<h1>` in content | 0 |
| S10 | Continue Reading footer | `<hr>` + Continue Reading + hub + siblings | present |
| S11 | Word count floor | Strip HTML, count words | ≥1,000 (spoke), ≥2,000 (pillar) |
| S12 | No banned phrases | Text search against banned list | 0 matches |
| S13 | No mojibake | Search for encoding artifacts | 0 matches |
| S14 | Featured image | sourceUrl and altText present | non-empty |

---

# 3. INTERNAL LINKING REQUIREMENTS (hard pass/fail)

| # | Requirement | Test | Threshold |
|---|------------|------|-----------|
| L1 | Body internal links | Count hrefs before `<hr>` | ≥3 |
| L2 | Hub link in body | At least one `/blog/` link in body | ≥1 |
| L3 | Sibling links | Links to other `/articles/` in same category | ≥2 |
| L4 | Cross-link validity | Every `/articles/X/` href resolves to a file on disk | 0 broken |
| L5 | No self-links | Article does not link to its own URL | 0 |
| L6 | Anchor text quality | Links use 3-6 word descriptive phrases, not "click here" | manual |
| L7 | First-link-wins | Same target linked only once in body | manual |
| L8 | Max link density | No more than 8 internal links in body | ≤8 |

---

# 4. SEO ON-PAGE REQUIREMENTS (hard pass/fail)

| # | Requirement | Test | Threshold |
|---|------------|------|-----------|
| P1 | Primary keyword in title | Title contains target keyword or close variant | present |
| P2 | Primary keyword in first 100 words | Strip HTML, check first 100 words | present |
| P3 | Excerpt answers search intent | Excerpt is a direct answer, not a teaser | manual |
| P4 | H2 headings keyword-relevant | H2s contain topic-relevant terms, not puns | manual |
| P5 | Slug matches keyword intent | Slug reflects primary keyword | manual |
| P6 | Category assignment correct | Article is in the right category for its topic | manual |

---

# 5. SEMANTIC DEPTH SIGNALS (measured, thresholds recommended)

These are the signals that distinguish a thin article from a
semantically rich one. They are measurable by script. Articles
that fall below thresholds are candidates for re-optimization.

| # | Signal | How measured | Threshold | Notes |
|---|--------|-------------|-----------|-------|
| D1 | Named entities | Count of capitalized multi-word phrases (people, places, institutions) | ≥5 per article | More = more topical depth |
| D2 | Unique years cited | Distinct 4-digit years (1400-2030) | ≥3 per article | Historical grounding |
| D3 | Specific data points | Counts, measurements, dollar amounts, percentages | ≥5 per article | Data density per writer config |
| D4 | Named people | Specific historical figures, researchers, officials | ≥3 per article | Per writer config |
| D5 | Source/authority refs | Mentions of books, archives, court records, historians, researchers | ≥1 per article | Primary source requirement |
| D6 | H2 topic breadth | Unique content words across all H2 headings | ≥8 unique terms | Measures topical diversity |
| D7 | Entity density | Named entities per 1,000 words | ≥3.0 per 1k | Normalized depth metric |
| D8 | Subtopic coverage | Number of distinct H2 sections addressing different facets | 4-8 H2s covering different angles | Not just splitting one idea |

---

# 6. WHAT "OPTIMIZED" MEANS

An article is considered **optimized** when:

1. **All structural requirements (S1-S14) pass** — zero fails
2. **All linking requirements (L1-L5) pass** — zero fails (L6-L8 manual)
3. **All on-page SEO requirements (P1-P2) pass** — zero fails (P3-P6 manual)
4. **All semantic depth signals (D1-D8) meet thresholds** — zero below minimum

An article is **partially optimized** when:
- Structural and linking requirements pass
- But 1-2 semantic signals fall below threshold

An article is **unoptimized** when:
- Any structural requirement fails, OR
- 3+ semantic signals fall below threshold

---

# 7. WHAT "OPTIMIZED" DOES NOT MEAN

- It does NOT mean Google will rank it. Google decides.
- It does NOT mean the content is subjectively "good." Voice and quality are separate.
- It does NOT guarantee competitor parity. Competitors may have domain authority, backlinks, or age advantages we can't match with on-page alone.
- These criteria are necessary conditions, not sufficient conditions.

---

# 8. AUDIT PROCESS

When running an optimization audit:

1. **Run the audit script** (`audit.py`) — produces structural + semantic scorecard
2. **Log every action** — Cowork must write an `AUDIT-LOG.md` recording:
   - Timestamp of audit start/end
   - Number of articles scanned
   - Summary scorecard (pass/fail/warning counts)
   - List of articles that fail any requirement, with specific failures
   - List of articles below semantic thresholds, with specific signals
   - Any actions taken (fixes applied, articles re-optimized)
   - Any actions deferred (with reason)
3. **Persist the report** — `AUDIT-REPORT.md` stays in the repo as the latest snapshot
4. **Compare to previous** — if a prior `AUDIT-REPORT.md` exists, note improvements/regressions

---

# 9. COWORK LOGGING REQUIREMENTS

Every Cowork session that touches article content MUST produce:

**File: `AUDIT-LOG.md`** (append-only, never overwrite)

Each entry:
```
## [YYYY-MM-DD HH:MM] — [Session Type]
**Operator:** Cowork / [role name]
**Scope:** [which articles, how many]
**Actions taken:**
- [article-slug]: [what was changed and why]
- [article-slug]: [what was changed and why]
**Results:**
- Articles modified: N
- Structural fixes: N
- Semantic improvements: N
- Deferred: N (reason)
**Audit score before:** [if available]
**Audit score after:** [run audit.py, paste summary]
```

This log is the proof of work. Without it, we cannot verify
what Cowork did or whether the pipeline goals were met.

---

# 10. VERSIONING

- This spec: `SEO-OPTIMIZATION-SPEC.md` v1.0
- Audit script: `audit.py` v1.1
- Audit report: `AUDIT-REPORT.md` (generated, timestamped)
- Audit log: `AUDIT-LOG.md` (append-only history)

Changes to thresholds or requirements increment the spec version.
The audit script must match the spec version it tests against.

---

END OF SPEC
