/**
 * CursedTours Build Output Validation
 * Checks the dist/ folder after `npm run build` to verify:
 *   - Expected page count (no major drops)
 *   - Key pages exist (hubs, article pages, sitemap)
 *   - No empty HTML files
 *   - Sitemap.xml present and valid
 *
 * Run: node tests/build-validation.mjs
 * (Requires a prior `npm run build`)
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

// ── Config ──
const MIN_EXPECTED_PAGES = 200; // Alert if page count drops below this
const REQUIRED_PAGES = [
  'index.html',
  'articles/index.html',
  'sitemap.xml',
];
const REQUIRED_HUB_CITIES = [
  'salem-ghost-tours', 'new-orleans-ghost-tours', 'savannah-ghost-tours',
  'charleston-ghost-tours', 'boston-ghost-tours', 'chicago-ghost-tours',
  'edinburgh-ghost-tours', 'london-ghost-tours', 'new-york-ghost-tours',
  'st-augustine-ghost-tours', 'san-antonio-ghost-tours', 'key-west-ghost-tours',
  'rome-ghost-tours', 'paris-ghost-tours', 'dublin-ghost-tours',
  'washington-dc-ghost-tours', 'nashville-ghost-tours', 'austin-ghost-tours',
  'denver-ghost-tours',
];

// ── Test runner ──
let pass = 0;
let fail = 0;
let warn = 0;
const errors = [];
const warnings = [];

function ok(msg) { pass++; }
function bad(msg) { fail++; errors.push(`  ✗ ${msg}`); }
function notice(msg) { warn++; warnings.push(`  ⚠ ${msg}`); }

console.log(`\n  CursedTours Build Output Validation`);
console.log(`  ───────────────────────────────────\n`);

// ── Check dist/ exists ──
if (!existsSync(DIST)) {
  console.log('  ✗ dist/ folder not found. Run `npm run build` first.\n');
  process.exit(1);
}

// ── Count all HTML pages ──
function findHtmlFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findHtmlFiles(full, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const htmlFiles = findHtmlFiles(DIST);
console.log(`  Found ${htmlFiles.length} HTML pages in dist/\n`);

// Page count check
if (htmlFiles.length < MIN_EXPECTED_PAGES) {
  bad(`Only ${htmlFiles.length} pages built (expected ≥${MIN_EXPECTED_PAGES}) — possible build regression`);
} else {
  ok(`Page count: ${htmlFiles.length}`);
}

// ── Required pages exist ──
for (const page of REQUIRED_PAGES) {
  const pagePath = join(DIST, page);
  if (!existsSync(pagePath)) {
    bad(`Missing required page: ${page}`);
  } else {
    ok(`Found ${page}`);
  }
}

// ── Hub city pages ──
for (const hub of REQUIRED_HUB_CITIES) {
  const hubPath = join(DIST, hub, 'index.html');
  if (!existsSync(hubPath)) {
    bad(`Missing hub page: ${hub}/index.html`);
  } else {
    const size = statSync(hubPath).size;
    if (size < 5000) {
      notice(`Hub page ${hub} is only ${size} bytes (may be empty/broken)`);
    } else {
      ok(`Hub: ${hub}`);
    }
  }
}

// ── Check for empty HTML files (possible build errors) ──
let emptyCount = 0;
for (const file of htmlFiles) {
  const size = statSync(file).size;
  if (size < 500) {
    emptyCount++;
    if (emptyCount <= 5) {
      const rel = file.replace(DIST, '').replace(/\\/g, '/');
      notice(`Suspiciously small file (${size}b): ${rel}`);
    }
  }
}
if (emptyCount > 5) {
  notice(`...and ${emptyCount - 5} more small files`);
}
if (emptyCount === 0) {
  ok('No empty/tiny HTML files');
}

// ── Sitemap check ──
const sitemapPath = join(DIST, 'sitemap.xml');
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf-8');
  if (sitemap.includes('<sitemapindex') || sitemap.includes('<urlset')) {
    ok('Sitemap is valid XML structure');
  } else {
    bad('Sitemap exists but has no <sitemapindex> or <urlset> root');
  }
  const locCount = (sitemap.match(/<loc>/g) || []).length;
  if (locCount > 0) {
    console.log(`  Sitemap has ${locCount} entries`);
    ok('Sitemap has entries');
  } else {
    bad('Sitemap has 0 <loc> entries');
  }
}

// ── Summary Report ──
console.log('\n  ───────────────────────────────────');
console.log(`  Results: ${pass} passed, ${fail} failed, ${warn} warnings`);
console.log(`  Pages: ${htmlFiles.length} | Hubs: ${REQUIRED_HUB_CITIES.length}\n`);

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
  console.log('  ✓ Build output looks good!\n');
} else {
  console.log(`  ✗ ${fail} issue(s) found in build output.\n`);
  process.exit(1);
}
