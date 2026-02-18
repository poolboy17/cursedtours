/**
 * CursedTours Auto-Fix Engine
 * Two-tier correction system:
 *   TIER 1 (auto-fix): Safe fixes applied immediately
 *     - Duplicate IDs → assign next available ID
 *     - Excerpt > 160 chars → trim to sentence boundary
 *     - Missing date → use file mtime
 *     - Invalid date format → normalize to ISO
 *     - URI mismatch → correct to /articles/{slug}/
 *     - Status typos → normalize to 'publish'
 *
 *   TIER 2 (proposed): Generates fix-report.json for review
 *     - Unknown categories → suggest closest match
 *     - Content < 300 words → flag for expansion
 *     - Missing featured image → suggest from slug
 *     - Short content (< 800 words) → SEO warning
 *
 * Run: node tests/auto-fix.mjs [--dry-run] [--apply]
 *   --dry-run  Show what would change without writing (default)
 *   --apply    Actually write fixes to disk
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ARTICLES_DIR = join(ROOT, 'src', 'data', 'articles');
const REPORT_PATH = join(ROOT, 'tests', 'fix-report.json');

const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--apply');

// ── Valid categories ──
const VALID_CATEGORIES = [
  'salem-witch-trials', 'new-orleans-voodoo-haunted-history',
  'chicago-haunted-history', 'savannah-haunted-history',
  'charleston-haunted-history', 'boston-haunted-history',
  'edinburgh-haunted-history', 'london-haunted-history',
  'new-york-haunted-history', 'st-augustine-haunted-history',
  'san-antonio-haunted-history', 'rome-haunted-history',
  'paris-haunted-history', 'dublin-haunted-history',
  'washington-dc-haunted-history', 'nashville-haunted-history',
  'austin-haunted-history', 'denver-haunted-history',
  'key-west-haunted-history',
  'vampire-culture', 'salem-witch-trials-history',
  'tower-of-london-history', 'american-prison-history',
  'gettysburg-civil-war',
];

// ── Tracking ──
const autoFixed = [];
const proposed = [];
let filesModified = 0;

console.log(`\n  CursedTours Auto-Fix Engine`);
console.log(`  ──────────────────────────`);
console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (use --apply to write)' : '⚡ APPLYING FIXES'}\n`);

// ── Load all articles + collect IDs ──
const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'));
const usedIds = new Set();
const articles = [];

// First pass: collect all IDs
for (const file of files) {
  try {
    const data = JSON.parse(readFileSync(join(ARTICLES_DIR, file), 'utf-8'));
    if (data.id !== undefined) usedIds.add(data.id);
    articles.push({ file, data, path: join(ARTICLES_DIR, file) });
  } catch {
    proposed.push({ file, issue: 'Invalid JSON — cannot auto-fix', severity: 'critical' });
  }
}

function nextId() {
  let id = Math.max(...usedIds) + 1;
  while (usedIds.has(id)) id++;
  usedIds.add(id);
  return id;
}

// ── Levenshtein distance for category suggestion ──
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] :
        1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function suggestCategory(invalid) {
  let best = null, bestDist = Infinity;
  for (const cat of VALID_CATEGORIES) {
    const d = levenshtein(invalid, cat);
    if (d < bestDist) { bestDist = d; best = cat; }
  }
  return { suggestion: best, distance: bestDist };
}

// ── Trim excerpt to sentence boundary ≤ 160 chars ──
function trimExcerpt(text) {
  if (text.length <= 160) return text;
  const truncated = text.slice(0, 160);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastBang = truncated.lastIndexOf('!');
  const lastQ = truncated.lastIndexOf('?');
  const cutoff = Math.max(lastPeriod, lastBang, lastQ);
  if (cutoff > 80) return text.slice(0, cutoff + 1);
  // No good sentence boundary — cut at last space + ellipsis
  const lastSpace = truncated.lastIndexOf(' ');
  return text.slice(0, lastSpace > 50 ? lastSpace : 155) + '...';
}

// ── Second pass: detect and fix ──
const seenIds = new Set();
const seenSlugs = new Set();

for (const { file, data, path } of articles) {
  let modified = false;
  const expectedSlug = file.replace('.json', '');

  // TIER 1: Duplicate ID → assign new one
  if (data.id !== undefined && seenIds.has(data.id)) {
    const oldId = data.id;
    data.id = nextId();
    autoFixed.push({ file, fix: `Duplicate ID ${oldId} → ${data.id}`, tier: 1 });
    modified = true;
  }
  if (data.id !== undefined) seenIds.add(data.id);

  // TIER 1: Slug doesn't match filename
  if (data.slug && data.slug !== expectedSlug) {
    const oldSlug = data.slug;
    data.slug = expectedSlug;
    autoFixed.push({ file, fix: `Slug "${oldSlug}" → "${expectedSlug}" (match filename)`, tier: 1 });
    modified = true;
  }

  // TIER 1: URI mismatch
  if (data.slug && data.uri !== `/articles/${data.slug}/`) {
    const oldUri = data.uri;
    data.uri = `/articles/${data.slug}/`;
    autoFixed.push({ file, fix: `URI "${oldUri}" → "${data.uri}"`, tier: 1 });
    modified = true;
  }

  // TIER 1: Invalid date → normalize
  if (data.date) {
    const d = new Date(data.date);
    if (isNaN(d.getTime())) {
      // Try to get from file mtime
      const mtime = statSync(path).mtime;
      data.date = mtime.toISOString().split('T')[0];
      autoFixed.push({ file, fix: `Invalid date → ${data.date} (from file mtime)`, tier: 1 });
      modified = true;
    }
  }

  // TIER 1: Status normalization
  if (data.status && !['publish', 'draft', 'pending'].includes(data.status)) {
    const old = data.status;
    data.status = 'publish';
    autoFixed.push({ file, fix: `Status "${old}" → "publish"`, tier: 1 });
    modified = true;
  }

  // TIER 1: Excerpt too long → trim
  if (data.excerpt && data.excerpt.length > 160) {
    const oldLen = data.excerpt.length;
    data.excerpt = trimExcerpt(data.excerpt);
    autoFixed.push({ file, fix: `Excerpt ${oldLen} → ${data.excerpt.length} chars (trimmed)`, tier: 1 });
    modified = true;
  }

  // TIER 2: Unknown category → suggest
  if (Array.isArray(data.categories)) {
    for (const cat of data.categories) {
      const catSlug = typeof cat === 'string' ? cat : cat?.slug;
      if (catSlug && !VALID_CATEGORIES.includes(catSlug)) {
        const { suggestion, distance } = suggestCategory(catSlug);
        proposed.push({
          file,
          issue: `Unknown category "${catSlug}"`,
          suggestion: distance <= 5
            ? `Reassign to "${suggestion}" (distance: ${distance})`
            : `Add "${catSlug}" as new category, or reassign manually`,
          severity: 'error',
          autoFixable: distance <= 3,
          proposedFix: distance <= 3 ? { field: 'categories', from: catSlug, to: suggestion } : null,
        });
      }
    }
  }

  // TIER 2: Content too short
  if (data.content) {
    const wordCount = data.content.split(/\s+/).filter(Boolean).length;
    if (wordCount < 300) {
      proposed.push({
        file,
        issue: `Content is only ${wordCount} words (minimum 300)`,
        suggestion: 'Expand article content — too thin for SEO',
        severity: 'error',
      });
    } else if (wordCount < 800) {
      proposed.push({
        file,
        issue: `Content is ${wordCount} words (800+ recommended)`,
        suggestion: 'Consider expanding for better SEO performance',
        severity: 'warning',
      });
    }
  }

  // TIER 2: Missing featured image
  if (!data.featuredImage) {
    proposed.push({
      file,
      issue: 'No featured image',
      suggestion: `Add featuredImage field, e.g., "/images/articles/${expectedSlug}.webp"`,
      severity: 'warning',
    });
  }

  // Write back if modified
  if (modified) {
    filesModified++;
    if (!DRY_RUN) {
      writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    }
  }
}

// ── Write fix report ──
const report = {
  timestamp: new Date().toISOString(),
  mode: DRY_RUN ? 'dry-run' : 'applied',
  summary: {
    articlesScanned: articles.length,
    autoFixed: autoFixed.length,
    proposedFixes: proposed.filter(p => p.severity === 'error').length,
    warnings: proposed.filter(p => p.severity === 'warning').length,
    filesModified,
  },
  tier1_autoFixed: autoFixed,
  tier2_proposed: proposed,
};

writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf-8');

// ── Console Output ──
console.log(`  Scanned: ${articles.length} articles`);
console.log(`  ──────────────────────────\n`);

if (autoFixed.length > 0) {
  console.log(`  TIER 1 — Auto-Fixed (${autoFixed.length}):`);
  for (const f of autoFixed) {
    console.log(`    ${DRY_RUN ? '⏸' : '✓'} [${f.file}] ${f.fix}`);
  }
  console.log('');
}

const tier2Errors = proposed.filter(p => p.severity === 'error');
const tier2Warnings = proposed.filter(p => p.severity === 'warning');

if (tier2Errors.length > 0) {
  console.log(`  TIER 2 — Needs Review (${tier2Errors.length} errors):`);
  for (const p of tier2Errors) {
    console.log(`    ✗ [${p.file}] ${p.issue}`);
    if (p.suggestion) console.log(`      → ${p.suggestion}`);
  }
  console.log('');
}

if (tier2Warnings.length > 0) {
  console.log(`  TIER 2 — Warnings (${tier2Warnings.length}):`);
  for (const p of tier2Warnings.slice(0, 10)) {
    console.log(`    ⚠ [${p.file}] ${p.issue}`);
  }
  if (tier2Warnings.length > 10) {
    console.log(`    ... and ${tier2Warnings.length - 10} more (see fix-report.json)`);
  }
  console.log('');
}

console.log(`  Report saved: tests/fix-report.json`);

if (DRY_RUN && autoFixed.length > 0) {
  console.log(`\n  Run with --apply to write ${autoFixed.length} auto-fixes to disk.`);
}

if (autoFixed.length === 0 && tier2Errors.length === 0) {
  console.log(`\n  ✓ No issues found — site is clean!\n`);
} else {
  console.log(`\n  ${autoFixed.length} auto-fixable | ${tier2Errors.length} need review | ${tier2Warnings.length} warnings\n`);
}
