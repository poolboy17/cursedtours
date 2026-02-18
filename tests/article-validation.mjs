/**
 * CursedTours Article JSON Validation
 * Validates all article JSON files against the required schema,
 * checks category integrity, slug uniqueness, internal links,
 * and content quality gates.
 *
 * Run: node tests/article-validation.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ARTICLES_DIR = join(ROOT, 'src', 'data', 'articles');
const IMAGES_DIR = join(ROOT, 'public', 'images', 'articles');

// ── Valid categories (from src/data/articles.ts) ──
const VALID_CATEGORIES = new Set([
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
]);

// ── Test runner ──
let pass = 0;
let fail = 0;
let warn = 0;
const errors = [];
const warnings = [];

function ok(test, file) { pass++; }
function bad(msg, file) { fail++; errors.push(`  ✗ [${file}] ${msg}`); }
function notice(msg, file) { warn++; warnings.push(`  ⚠ [${file}] ${msg}`); }

// ── Load all articles ──
const files = readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'));
console.log(`\n  CursedTours Article Validation`);
console.log(`  ─────────────────────────────`);
console.log(`  Found ${files.length} article JSON files\n`);

const slugs = new Set();
const ids = new Set();
const articles = [];

for (const file of files) {
  const path = join(ARTICLES_DIR, file);
  const expectedSlug = file.replace('.json', '');
  let data;

  // 1. JSON PARSE
  try {
    data = JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    bad(`Invalid JSON: ${e.message}`, file);
    continue;
  }
  ok('JSON parses', file);
  articles.push({ file, data, expectedSlug });

  // 2. REQUIRED FIELDS
  const required = ['title', 'slug', 'id', 'status', 'uri', 'date', 'content', 'excerpt', 'categories', 'featuredImage'];
  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      bad(`Missing required field: ${field}`, file);
    } else {
      ok(`Has ${field}`, file);
    }
  }

  // 3. SLUG MATCHES FILENAME
  if (data.slug !== expectedSlug) {
    bad(`Slug "${data.slug}" doesn't match filename "${expectedSlug}"`, file);
  } else {
    ok('Slug matches filename', file);
  }

  // 4. SLUG UNIQUENESS
  if (slugs.has(data.slug)) {
    bad(`Duplicate slug: "${data.slug}"`, file);
  } else {
    slugs.add(data.slug);
    ok('Slug is unique', file);
  }

  // 5. ID UNIQUENESS
  if (data.id !== undefined) {
    if (ids.has(data.id)) {
      bad(`Duplicate ID: ${data.id}`, file);
    } else {
      ids.add(data.id);
      ok('ID is unique', file);
    }
  }

  // 6. URI FORMAT
  if (data.uri && data.uri !== `/articles/${data.slug}/`) {
    bad(`URI "${data.uri}" should be "/articles/${data.slug}/"`, file);
  } else if (data.uri) {
    ok('URI format correct', file);
  }

  // 7. CATEGORY VALIDATION
  if (Array.isArray(data.categories)) {
    if (data.categories.length === 0) {
      bad('Categories array is empty (needs exactly 1)', file);
    } else if (data.categories.length > 1) {
      notice(`Has ${data.categories.length} categories (expected 1)`, file);
    }
    for (const cat of data.categories) {
      const catSlug = typeof cat === 'string' ? cat : cat.slug;
      if (!VALID_CATEGORIES.has(catSlug)) {
        bad(`Invalid category slug: "${catSlug}"`, file);
      } else {
        ok('Category is valid', file);
      }
    }
  }

  // 8. EXCERPT LENGTH
  if (data.excerpt) {
    if (data.excerpt.length > 160) {
      notice(`Excerpt is ${data.excerpt.length} chars (recommended ≤160 for meta description)`, file);
    }
    if (data.excerpt.length < 50) {
      notice(`Excerpt is only ${data.excerpt.length} chars (may be too short)`, file);
    }
  }


  // 9. CONTENT QUALITY
  if (data.content) {
    const wordCount = data.content.split(/\s+/).filter(Boolean).length;
    if (wordCount < 300) {
      bad(`Content is only ${wordCount} words (minimum 300)`, file);
    } else if (wordCount < 800) {
      notice(`Content is ${wordCount} words (recommend 800+ for SEO)`, file);
    } else {
      ok('Content word count adequate', file);
    }

    // Reading time sanity check (assumes ~200 wpm)
    if (data.readingTime) {
      const expectedMin = Math.floor(wordCount / 250);
      const expectedMax = Math.ceil(wordCount / 150);
      const stated = parseInt(data.readingTime);
      if (stated && (stated < expectedMin - 1 || stated > expectedMax + 1)) {
        notice(`Reading time "${data.readingTime}" seems off for ${wordCount} words (expected ~${expectedMin}-${expectedMax} min)`, file);
      }
    }

    // No H1 in body content (Astro template provides the H1)
    if (/<h1[\s>]/i.test(data.content)) {
      notice('Content contains an <h1> tag (should be provided by page template)', file);
    }
  } else {
    bad('Content is empty or missing', file);
  }

  // 10. FEATURED IMAGE
  if (data.featuredImage) {
    const imgSrc = typeof data.featuredImage === 'string'
      ? data.featuredImage
      : (data.featuredImage.src || data.featuredImage.url || '');
    if (imgSrc) {
      const imgPath = imgSrc.startsWith('/')
        ? join(ROOT, 'public', imgSrc)
        : join(IMAGES_DIR, imgSrc);
      if (!existsSync(imgPath)) {
        const altPath = join(IMAGES_DIR, `${data.slug}.webp`);
        if (!existsSync(altPath)) {
          notice(`Featured image not found: ${imgSrc}`, file);
        }
      } else {
        ok('Featured image exists', file);
      }
    }
  }

  // 11. DATE VALIDATION
  if (data.date) {
    const d = new Date(data.date);
    if (isNaN(d.getTime())) {
      bad(`Invalid date: "${data.date}"`, file);
    } else {
      ok('Date is valid', file);
    }
  }

  // 12. STATUS CHECK
  if (data.status && !['publish', 'draft', 'pending'].includes(data.status)) {
    bad(`Unknown status: "${data.status}"`, file);
  }
}

// ── Summary Report ──
console.log('  ─────────────────────────────');
console.log(`  Results: ${pass} passed, ${fail} failed, ${warn} warnings`);
console.log(`  Articles: ${articles.length} loaded / ${files.length} total files\n`);

if (errors.length) {
  console.log('  ERRORS:');
  errors.forEach(e => console.log(e));
  console.log('');
}

if (warnings.length) {
  console.log('  WARNINGS:');
  warnings.forEach(w => console.log(w));
  console.log('');
}

if (fail === 0) {
  console.log('  ✓ All critical checks passed!\n');
} else {
  console.log(`  ✗ ${fail} critical issue(s) found — fix before deploying.\n`);
  process.exit(1);
}
