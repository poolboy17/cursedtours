/**
 * CursedTours Hub Page Audit — Local Test Runner
 * Zero external dependencies — uses Node built-ins only.
 * Validates all 18 city hub pages after `astro build`.
 * Run: npm run test:hubs (requires dist/ to exist)
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// ─── Config ───────────────────────────────────────────────────
const DIST_DIR = join(process.cwd(), 'dist');
const HUB_PATTERN = /^[a-z-]+-ghost-tours$/;

const FULL_TEMPLATE_PAGES = new Set([
  'charleston-ghost-tours', 'chicago-ghost-tours', 'edinburgh-ghost-tours',
  'london-ghost-tours', 'new-orleans-ghost-tours', 'salem-ghost-tours',
  'savannah-ghost-tours', 'st-augustine-ghost-tours'
]);

// ─── Result tracking ──────────────────────────────────────────
let totalPass = 0, totalWarn = 0, totalFail = 0;
const results = [];

function pass(page, check, detail = '') {
  totalPass++;
  results.push({ status: 'PASS', page, check, detail });
}
function warn(page, check, detail = '') {
  totalWarn++;
  results.push({ status: 'WARN', page, check, detail });
}
function fail(page, check, detail = '') {
  totalFail++;
  results.push({ status: 'FAIL', page, check, detail });
}

// ─── Helpers (regex-based DOM parsing) ────────────────────────
function allMatches(html, regex) {
  const matches = [];
  let m;
  const r = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  while ((m = r.exec(html)) !== null) matches.push(m);
  return matches;
}

function countMatches(html, pattern) {
  if (typeof pattern === 'string') {
    let count = 0, idx = -1;
    while ((idx = html.indexOf(pattern, idx + 1)) !== -1) count++;
    return count;
  }
  return (html.match(pattern) || []).length;
}

function extractIds(html) {
  return allMatches(html, /\bid="([^"]+)"/g).map(m => m[1]);
}

function extractSectionIds(html) {
  return allMatches(html, /<section[^>]+id="([^"]+)"/g).map(m => m[1]);
}

function extractAnchorHrefs(html) {
  // Only hash anchors from nav pills (rounded-full class)
  const pills = allMatches(html, /<a[^>]+href="#([^"]+)"[^>]*class="[^"]*rounded-full[^"]*"/g);
  return pills.map(m => m[1]);
}

// ─── Test: HTML Integrity ─────────────────────────────────────
function testHtmlIntegrity(html, page) {
  const openDivs = countMatches(html, /<div[\s>]/g);
  const closeDivs = countMatches(html, /<\/div>/g);
  if (openDivs === closeDivs) {
    pass(page, 'div-balance', `${openDivs} divs balanced`);
  } else {
    fail(page, 'div-balance', `open=${openDivs} close=${closeDivs} diff=${openDivs - closeDivs}`);
  }

  const openSections = countMatches(html, /<section[\s>]/g);
  const closeSections = countMatches(html, /<\/section>/g);
  if (openSections === closeSections) {
    pass(page, 'section-balance', `${openSections} sections balanced`);
  } else {
    fail(page, 'section-balance', `open=${openSections} close=${closeSections}`);
  }

  // Nesting bug: callout inside another callout
  const calloutPositions = [];
  let idx = -1;
  while ((idx = html.indexOf('bg-gradient-to-b from-purple-950', idx + 1)) !== -1) {
    calloutPositions.push(idx);
  }
  let nested = false;
  for (let i = 1; i < calloutPositions.length; i++) {
    const between = html.substring(calloutPositions[i - 1], calloutPositions[i]);
    const opensInBetween = countMatches(between, /<div[\s>]/g);
    const closesInBetween = countMatches(between, /<\/div>/g);
    if (opensInBetween > closesInBetween) {
      nested = true;
      break;
    }
  }
  if (nested) {
    fail(page, 'callout-nesting', 'Callout appears nested inside another callout');
  } else {
    pass(page, 'callout-nesting', 'No nesting issues');
  }
}

// ─── Test: Duplicate IDs ──────────────────────────────────────
function testDuplicateIds(html, page) {
  const ids = extractIds(html);
  const seen = {};
  ids.forEach(id => seen[id] = (seen[id] || 0) + 1);
  const dupes = Object.entries(seen).filter(([, n]) => n > 1);
  if (dupes.length === 0) {
    pass(page, 'unique-ids', `${ids.length} IDs, all unique`);
  } else {
    fail(page, 'unique-ids', `Duplicates: ${dupes.map(([id, n]) => `${id}(${n})`).join(', ')}`);
  }
}

// ─── Test: Anchor Links (Orphan Nav Pills) ────────────────────
function testAnchorLinks(html, page) {
  const pillTargets = extractAnchorHrefs(html);
  const allIds = new Set(extractIds(html));

  let orphans = 0;
  for (const target of pillTargets) {
    if (!allIds.has(target)) {
      fail(page, 'anchor-link', `Orphan nav pill: #${target} — no matching element`);
      orphans++;
    }
  }
  if (orphans === 0 && pillTargets.length > 0) {
    pass(page, 'anchor-links', `${pillTargets.length} nav pills all valid`);
  } else if (pillTargets.length === 0) {
    fail(page, 'anchor-links', 'No nav pills found');
  }
}

// ─── Test: Required Elements ──────────────────────────────────
function testRequiredElements(html, page) {
  // FAQ schema
  if (html.includes('"FAQPage"')) {
    pass(page, 'faq-schema', 'FAQPage schema present');
  } else {
    fail(page, 'faq-schema', 'Missing FAQPage schema');
  }

  // Canonical URL
  const canonical = html.match(/rel="canonical"\s+href="([^"]+)"/);
  if (canonical) {
    pass(page, 'canonical', canonical[1]);
  } else {
    fail(page, 'canonical', 'Missing canonical URL');
  }

  // Hero background image
  if (html.includes('background-image: url(')) {
    pass(page, 'hero-bg', 'Hero background image present');
  } else {
    fail(page, 'hero-bg', 'Missing hero background image');
  }

  // Breadcrumbs
  if (html.includes('<ol') && html.includes('Home</a>')) {
    pass(page, 'breadcrumbs', 'Breadcrumbs present');
  } else {
    fail(page, 'breadcrumbs', 'Missing breadcrumbs');
  }

  // Category nav pills
  const pillCount = extractAnchorHrefs(html).length;
  if (pillCount >= 3) {
    pass(page, 'nav-pills', `${pillCount} category pills`);
  } else {
    fail(page, 'nav-pills', `Only ${pillCount} category pills (expected 3+)`);
  }

  // Explore More
  if (html.includes('Explore More Haunted Cities')) {
    pass(page, 'explore-more', 'Present');
  } else {
    fail(page, 'explore-more', 'Missing Explore More section');
  }

  // Why [City] Is Haunted
  const whyMatch = html.match(/Why\s+[\w\s.'-]+\s+(?:Is|Are)\s+Haunted/i);
  const whyAlt = html.match(/Why\s+[\w\s.'-]+\s+(?:Most\s+)?Haunted/i);
  if (whyMatch) {
    pass(page, 'why-haunted', whyMatch[0]);
  } else if (whyAlt) {
    warn(page, 'why-haunted', `Non-standard: "${whyAlt[0]}"`);
  } else {
    fail(page, 'why-haunted', 'Missing Why section');
  }
}

// ─── Test: Scroll Cadence Components ──────────────────────────
function testScrollCadence(html, page) {
  // Tour sections (sections with id, excluding structural ones)
  const sectionIds = extractSectionIds(html);
  const structuralIds = new Set(['faq', 'explore-more', 'articles', 'explore']);
  const tourIds = sectionIds.filter(id => !structuralIds.has(id));
  const tourCount = tourIds.length;
  pass(page, 'tour-sections', `${tourCount} tours: ${tourIds.join(', ')}`);

  // Stat callouts
  const callouts = countMatches(html, 'bg-gradient-to-b from-purple-950');
  if (callouts >= 2) {
    pass(page, 'stat-callouts', `${callouts} callouts`);
  } else {
    warn(page, 'stat-callouts', `Only ${callouts} callout(s) — plan minimum is 2`);
  }

  // Pull quotes
  const quotes = countMatches(html, 'border-l-4 border-purple-500/50');
  const pageName = page.replace('-ghost-tours', '');
  const expectedQuotes = pageName === 'savannah' ? 2 : 1;
  if (quotes === expectedQuotes) {
    pass(page, 'pull-quotes', `${quotes} pull quote(s)`);
  } else if (quotes > 0) {
    warn(page, 'pull-quotes', `${quotes} quotes (expected ${expectedQuotes})`);
  } else {
    fail(page, 'pull-quotes', `0 pull quotes (expected ${expectedQuotes})`);
  }

  // Inter-tour dividers
  const dividers = countMatches(html, 'h-px bg-gradient-to-r from-transparent via-purple-500');
  const minDividers = Math.max(tourCount - 1, 0);
  if (dividers >= minDividers) {
    pass(page, 'dividers', `${dividers} dividers (min ${minDividers} for ${tourCount} tours)`);
  } else {
    fail(page, 'dividers', `${dividers} dividers (need at least ${minDividers})`);
  }

  // Glow blobs
  const glowBlobs = countMatches(html, 'rounded-full blur-3xl');
  if (glowBlobs === tourCount) {
    pass(page, 'glow-blobs', `${glowBlobs} blobs = ${tourCount} tours`);
  } else {
    warn(page, 'glow-blobs', `${glowBlobs} blobs vs ${tourCount} tours`);
  }

  // Shaded content blocks
  const shadedBlocks = countMatches(html, 'bg-[#0d0816]/60 rounded-xl');
  if (shadedBlocks === tourCount) {
    pass(page, 'shaded-blocks', `${shadedBlocks} shaded blocks`);
  } else {
    warn(page, 'shaded-blocks', `${shadedBlocks} blocks vs ${tourCount} tours`);
  }
}

// ─── Test: Visual Styling Consistency ─────────────────────────
function testVisualStyling(html, page) {
  const calloutsWithGlow = countMatches(html, 'text-shadow: 0 0 30px rgba(168, 85, 247');
  const calloutTotal = countMatches(html, 'bg-gradient-to-b from-purple-950');
  if (calloutTotal > 0 && calloutsWithGlow === calloutTotal) {
    pass(page, 'callout-glow', `${calloutsWithGlow}/${calloutTotal} have glow`);
  } else if (calloutTotal > 0) {
    fail(page, 'callout-glow', `${calloutsWithGlow}/${calloutTotal} have glow`);
  }

  const quotesWithBg = countMatches(html, 'bg-purple-950/[0.15] rounded-r-lg');
  const quoteTotal = countMatches(html, 'border-l-4 border-purple-500/50');
  if (quoteTotal > 0 && quotesWithBg === quoteTotal) {
    pass(page, 'quote-bg', `${quotesWithBg}/${quoteTotal} have background`);
  } else if (quoteTotal > 0) {
    fail(page, 'quote-bg', `${quotesWithBg}/${quoteTotal} have background`);
  }

  const overflow = countMatches(html, 'relative overflow-hidden');
  if (overflow >= 3) {
    pass(page, 'overflow-hidden', `${overflow} sections`);
  } else {
    warn(page, 'overflow-hidden', `Only ${overflow} sections have overflow-hidden`);
  }
}

// ─── Test: Content Gaps ───────────────────────────────────────
function testContentGaps(html, page) {
  // Hero tagline (italic text in hero section, before first tour section)
  const heroEnd = html.indexOf('<section id="');
  const heroChunk = heroEnd > 0 ? html.substring(0, heroEnd) : html.substring(0, 2000);
  if (heroChunk.includes('italic') && heroChunk.match(/<p[^>]*class="[^"]*italic/)) {
    const tagMatch = heroChunk.match(/<p[^>]*class="[^"]*italic[^"]*"[^>]*>([^<]+)/);
    pass(page, 'hero-tagline', tagMatch ? tagMatch[1].substring(0, 50) : 'Present');
  } else {
    warn(page, 'hero-tagline', 'No hero tagline');
  }

  // ogImage
  if (html.includes('og:image') && html.match(/property="og:image"[^>]+content="https?:\/\//)) {
    pass(page, 'og-image', 'og:image URL present');
  } else {
    warn(page, 'og-image', 'No og:image URL — social shares have no preview');
  }

  // Article grid (full template only)
  if (FULL_TEMPLATE_PAGES.has(page)) {
    if (html.includes('Articles') && html.match(/Explore[\s\S]{0,30}Articles/)) {
      pass(page, 'article-grid', 'Present (full template)');
    } else {
      fail(page, 'article-grid', 'Full template page missing article grid');
    }
  }
}

// ─── Test: Heading Hierarchy ──────────────────────────────────
function testHeadingHierarchy(html, page) {
  const headings = allMatches(html, /<(h[1-6])[^>]*>/g).map(m => parseInt(m[1][1]));
  if (headings.length === 0) {
    fail(page, 'heading-hierarchy', 'No headings found');
    return;
  }
  if (headings[0] !== 1) {
    fail(page, 'heading-hierarchy', `First heading is h${headings[0]}, expected h1`);
    return;
  }
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      fail(page, 'heading-hierarchy', `Skip: h${headings[i - 1]} → h${headings[i]}`);
      return;
    }
  }
  pass(page, 'heading-hierarchy', `${headings.length} headings, no skips`);
}

// ─── Test: Padding Variation ──────────────────────────────────
function testPaddingVariation(html, page) {
  const bumped = countMatches(html, 'py-16 md:py-20');
  const standard = countMatches(html, 'py-12 md:py-16');
  if (bumped >= 2 && standard >= 4) {
    pass(page, 'padding-variation', `${bumped} bumped + ${standard} standard`);
  } else if (bumped === 0) {
    fail(page, 'padding-variation', 'All sections have identical padding');
  } else {
    warn(page, 'padding-variation', `bumped=${bumped} standard=${standard}`);
  }
}

// ─── Main Runner ──────────────────────────────────────────────
function findHubPages() {
  if (!existsSync(DIST_DIR)) {
    console.error('\x1b[31m✗ dist/ not found. Run `npm run build` first.\x1b[0m');
    process.exit(1);
  }
  return readdirSync(DIST_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && HUB_PATTERN.test(d.name))
    .map(d => ({ name: d.name, path: join(DIST_DIR, d.name, 'index.html') }))
    .filter(p => existsSync(p.path))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function auditPage(pagePath, pageName) {
  const html = readFileSync(pagePath, 'utf-8');
  testHtmlIntegrity(html, pageName);
  testDuplicateIds(html, pageName);
  testAnchorLinks(html, pageName);
  testRequiredElements(html, pageName);
  testScrollCadence(html, pageName);
  testVisualStyling(html, pageName);
  testContentGaps(html, pageName);
  testHeadingHierarchy(html, pageName);
  testPaddingVariation(html, pageName);
}

function printReport() {
  console.log('\n\x1b[1m══════════════════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[1m           CURSEDTOURS HUB PAGE AUDIT REPORT\x1b[0m');
  console.log('\x1b[1m══════════════════════════════════════════════════════════════\x1b[0m\n');

  const pages = {};
  for (const r of results) {
    if (!pages[r.page]) pages[r.page] = [];
    pages[r.page].push(r);
  }

  for (const [page, checks] of Object.entries(pages)) {
    const fails = checks.filter(c => c.status === 'FAIL');
    const warns = checks.filter(c => c.status === 'WARN');
    const passes = checks.filter(c => c.status === 'PASS');

    const icon = fails.length > 0 ? '\x1b[31m✗\x1b[0m' :
                 warns.length > 0 ? '\x1b[33m!\x1b[0m' : '\x1b[32m✓\x1b[0m';

    console.log(`${icon} \x1b[1m${page}\x1b[0m  (${passes.length}P ${warns.length}W ${fails.length}F)`);

    for (const r of fails) {
      console.log(`    \x1b[31mFAIL ${r.check}\x1b[0m: ${r.detail}`);
    }
    for (const r of warns) {
      console.log(`    \x1b[33mWARN ${r.check}\x1b[0m: ${r.detail}`);
    }
  }

  console.log('\n\x1b[1m──────────────────────────────────────────────────────────────\x1b[0m');
  console.log(`  \x1b[32m${totalPass} passed\x1b[0m  \x1b[33m${totalWarn} warnings\x1b[0m  \x1b[31m${totalFail} failures\x1b[0m`);
  console.log('\x1b[1m══════════════════════════════════════════════════════════════\x1b[0m\n');
  return totalFail;
}

// ─── Execute ──────────────────────────────────────────────────
console.log('\n  CursedTours Hub Audit — scanning dist/ ...\n');
const hubPages = findHubPages();
console.log(`  Found ${hubPages.length} hub pages\n`);

if (hubPages.length === 0) {
  console.error('\x1b[31mNo hub pages found in dist/.\x1b[0m');
  process.exit(1);
}

for (const { name, path } of hubPages) {
  auditPage(path, name);
}

const failCount = printReport();
process.exit(failCount > 0 ? 1 : 0);
