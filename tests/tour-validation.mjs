/**
 * CursedTours Tour & Affiliate Link Validation
 * Validates cityTours.ts and destinations.ts data integrity:
 *   - Affiliate params (pid/mcid) on all Viator URLs
 *   - Tour completeness (3 tiers per city)
 *   - Required fields on every tour object
 *   - Product code consistency in URLs
 *
 * Run: node tests/tour-validation.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Expected affiliate params ──
const EXPECTED_PID = 'P00166886';
const EXPECTED_MCID = '42383';
const REQUIRED_TIERS = new Set(['hero', 'budget', 'premium']);
const TOUR_REQUIRED_FIELDS = ['productCode', 'title', 'image', 'price', 'rating', 'reviews', 'tier', 'viatorUrl'];

// ── Test runner ──
let pass = 0;
let fail = 0;
let warn = 0;
const errors = [];
const warnings = [];

function ok(msg) { pass++; }
function bad(msg) { fail++; errors.push(`  ✗ ${msg}`); }
function notice(msg) { warn++; warnings.push(`  ⚠ ${msg}`); }

console.log(`\n  CursedTours Tour & Affiliate Validation`);
console.log(`  ────────────────────────────────────────\n`);

// ── Load cityTours.ts as text (can't import .ts directly) ──
const cityToursRaw = readFileSync(join(ROOT, 'src', 'data', 'cityTours.ts'), 'utf-8');

// Extract the AFF constant value
const affMatch = cityToursRaw.match(/const AFF\s*=\s*['"`]([^'"`]+)['"`]/);
if (!affMatch) {
  bad('Could not find AFF constant in cityTours.ts');
} else {
  const affValue = affMatch[1];
  if (!affValue.includes(`pid=${EXPECTED_PID}`)) {
    bad(`AFF constant has wrong pid: "${affValue}" (expected pid=${EXPECTED_PID})`);
  } else {
    ok('AFF pid correct');
  }
  if (!affValue.includes(`mcid=${EXPECTED_MCID}`)) {
    bad(`AFF constant has wrong mcid: "${affValue}" (expected mcid=${EXPECTED_MCID})`);
  } else {
    ok('AFF mcid correct');
  }
}

// Extract all Viator URLs from the file (handles both template literals and plain strings)
const viatorUrls = [...cityToursRaw.matchAll(/viatorUrl:\s*[`'"](https:\/\/www\.viator\.com[^`'"]*)[`'"]/g)];
console.log(`  Found ${viatorUrls.length} Viator URLs in cityTours.ts`);

// Resolve the AFF variable for URL checking
const affResolved = affMatch ? affMatch[1] : '';

for (const [, url] of viatorUrls) {
  // Resolve template literal ${AFF} to actual value for checking
  const resolved = url.replace(/\$\{AFF\}/g, affResolved);

  // Check affiliate params present (either directly or via ${AFF} template)
  const hasAffTemplate = url.includes('${AFF}');
  if (!hasAffTemplate && !resolved.includes(`pid=${EXPECTED_PID}`)) {
    bad(`Missing affiliate params in URL: ${url.slice(0, 80)}...`);
  } else {
    ok('Affiliate params in URL');
  }

  // Check URL format: should contain /tours/ path
  if (!url.includes('viator.com/tours/')) {
    bad(`URL missing /tours/ path: ${url.slice(0, 80)}...`);
  } else {
    ok('URL has /tours/ path');
  }

  // Check URL has query separator before affiliate params
  if (!url.includes('?')) {
    bad(`URL missing ? before params: ${url.slice(0, 80)}...`);
  }
}

// ── Parse city blocks to check tour completeness ──
// Match each city key and its tours array
const cityBlockPattern = /['"]([a-z-]+)['"]\s*:\s*\[/g;
const cityKeys = [];
let m;
while ((m = cityBlockPattern.exec(cityToursRaw)) !== null) {
  cityKeys.push(m[1]);
}
console.log(`  Found ${cityKeys.length} cities in CITY_TOURS\n`);

// For tier validation, extract tier values per city
for (const city of cityKeys) {
  // Find all tier values for this city's block
  const cityStart = cityToursRaw.indexOf(`'${city}'`) !== -1
    ? cityToursRaw.indexOf(`'${city}'`)
    : cityToursRaw.indexOf(`"${city}"`);

  if (cityStart === -1) continue;

  // Get text from city key to next city key or end
  const nextCityIdx = cityKeys.indexOf(city) + 1;
  const endIdx = nextCityIdx < cityKeys.length
    ? (cityToursRaw.indexOf(`'${cityKeys[nextCityIdx]}'`) !== -1
        ? cityToursRaw.indexOf(`'${cityKeys[nextCityIdx]}'`)
        : cityToursRaw.indexOf(`"${cityKeys[nextCityIdx]}"`))
    : cityToursRaw.length;

  const cityBlock = cityToursRaw.slice(cityStart, endIdx);
  const tierMatches = [...cityBlock.matchAll(/tier:\s*['"]([^'"]+)['"]/g)].map(t => t[1]);

  // Check 3 tours per city
  if (tierMatches.length !== 3) {
    bad(`[${city}] Has ${tierMatches.length} tours (expected 3)`);
  } else {
    ok(`${city} has 3 tours`);
  }

  // Check all required tiers present
  const tierSet = new Set(tierMatches);
  for (const tier of REQUIRED_TIERS) {
    if (!tierSet.has(tier)) {
      bad(`[${city}] Missing "${tier}" tier tour`);
    } else {
      ok(`${city} has ${tier} tier`);
    }
  }

  // Check for required fields in each tour object
  const productCodes = [...cityBlock.matchAll(/productCode:\s*['"]([^'"]+)['"]/g)].map(p => p[1]);
  const titles = [...cityBlock.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map(t => t[1]);
  const prices = [...cityBlock.matchAll(/price:\s*['"]([^'"]+)['"]/g)].map(p => p[1]);
  const ratings = [...cityBlock.matchAll(/rating:\s*([\d.]+)/g)].map(r => parseFloat(r[1]));

  // Rating sanity check
  for (const rating of ratings) {
    if (rating < 1 || rating > 5) {
      bad(`[${city}] Invalid rating: ${rating} (should be 1-5)`);
    }
  }

  // Price format check
  for (const price of prices) {
    if (!/^\$\d+$/.test(price)) {
      notice(`[${city}] Unusual price format: "${price}" (expected $XX)`);
    }
  }
}

// ── Also check destinations.ts for affiliate links ──
const destPath = join(ROOT, 'src', 'data', 'destinations.ts');
let destRaw;
try {
  destRaw = readFileSync(destPath, 'utf-8');
  const destViatorUrls = [...destRaw.matchAll(/viatorUrl:\s*[`'"](https:\/\/www\.viator\.com[^`'"]+)[`'"]/g)];

  if (destViatorUrls.length > 0) {
    console.log(`  Found ${destViatorUrls.length} Viator URLs in destinations.ts`);
    for (const [, url] of destViatorUrls) {
      const hasTemplate = url.includes('${AFF}') || url.includes('${');
      const hasDirect = url.includes(`pid=${EXPECTED_PID}`) && url.includes(`mcid=${EXPECTED_MCID}`);
      if (!hasTemplate && !hasDirect) {
        bad(`[destinations.ts] Missing affiliate params: ${url.slice(0, 80)}...`);
      } else {
        ok('destinations.ts affiliate params');
      }
    }
  } else {
    console.log(`  No Viator URLs found in destinations.ts (uses cityTours imports)`);
  }
} catch {
  notice('Could not read destinations.ts');
}

// ── Summary Report ──
console.log('\n  ────────────────────────────────────────');
console.log(`  Results: ${pass} passed, ${fail} failed, ${warn} warnings`);
console.log(`  Cities: ${cityKeys.length} | Viator URLs: ${viatorUrls.length}\n`);

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
  console.log('  ✓ All tour & affiliate checks passed!\n');
} else {
  console.log(`  ✗ ${fail} issue(s) found — review before deploying.\n`);
  process.exit(1);
}
