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
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Expected affiliate params ──
const EXPECTED_PID = 'P00166886';
const EXPECTED_MCID = '42383';
const REQUIRED_TIERS = new Set(['hero', 'budget', 'premium']);
const VALID_TIERS = new Set(['hero', 'budget', 'premium', 'alternative']);
const TOUR_REQUIRED_FIELDS = [
  'productCode',
  'title',
  'image',
  'price',
  'rating',
  'reviews',
  'tier',
  'viatorUrl',
];

// ── Test runner ──
let pass = 0;
let fail = 0;
let warn = 0;
const errors = [];
const warnings = [];

function ok() {
  pass++;
}

function bad(msg) {
  fail++;
  errors.push(`  ✗ ${msg}`);
}

function notice(msg) {
  warn++;
  warnings.push(`  ⚠ ${msg}`);
}

function extractTourObjects(block) {
  return [...block.matchAll(/\{[\s\S]*?\n\s*\}/g)].map((match) => match[0]);
}

function hasField(objectText, field) {
  return new RegExp(`\\b${field}\\s*:`, 'm').test(objectText);
}

function extractStringField(objectText, field) {
  const match = objectText.match(
    new RegExp(`${field}\\s*:\\s*['"\\x60]([^'"\\x60]+)['"\\x60]`, 'm')
  );
  return match ? match[1] : null;
}

function extractCodeFromViatorUrl(url) {
  const match = url.match(/\/d[^/?#]+-([^/?#]+)(?:\?|$)/);
  return match ? match[1] : null;
}

function validateTierCoverage(tiers, label, { exactCount = null, minCount = null } = {}) {
  if (exactCount !== null) {
    if (tiers.length !== exactCount) {
      bad(`[${label}] Has ${tiers.length} tours (expected ${exactCount})`);
    } else {
      ok(`${label} has ${exactCount} tours`);
    }
  }

  if (minCount !== null) {
    if (tiers.length < minCount) {
      bad(`[${label}] Has ${tiers.length} tours (expected at least ${minCount})`);
    } else {
      ok(`${label} has ${tiers.length} tours`);
    }
  }

  const tierSet = new Set(tiers);
  for (const tier of REQUIRED_TIERS) {
    if (!tierSet.has(tier)) {
      bad(`[${label}] Missing "${tier}" tier tour`);
    } else {
      ok(`${label} has ${tier} tier`);
    }
  }
}

console.log(`\n  CursedTours Tour & Affiliate Validation`);
console.log(`  ────────────────────────────────────────\n`);

// ── Load cityTours.ts as text (can't import .ts directly) ──
const cityToursRaw = readFileSync(join(ROOT, 'src', 'data', 'cityTours.ts'), 'utf-8');

// Extract the AFF constant value
const affMatch = cityToursRaw.match(/const AFF\s*=\s*['"`]([^'"`]+)['"`]/);
if (!affMatch) {
  bad('Could not find AFF constant in cityTours.ts');
}

const affResolved = affMatch ? affMatch[1] : '';

if (affMatch) {
  if (!affResolved.includes(`pid=${EXPECTED_PID}`)) {
    bad(`AFF constant has wrong pid: "${affResolved}" (expected pid=${EXPECTED_PID})`);
  } else {
    ok('AFF pid correct');
  }

  if (!affResolved.includes(`mcid=${EXPECTED_MCID}`)) {
    bad(`AFF constant has wrong mcid: "${affResolved}" (expected mcid=${EXPECTED_MCID})`);
  } else {
    ok('AFF mcid correct');
  }
}

function validateViatorUrl(url, label, expectedProductCode) {
  const resolved = url.replace(/\$\{AFF\}/g, affResolved);
  const hasAffTemplate = url.includes('${AFF}');

  if (!hasAffTemplate && !resolved.includes(`pid=${EXPECTED_PID}`)) {
    bad(`[${label}] Missing affiliate pid in URL: ${url.slice(0, 80)}...`);
  } else {
    ok(`${label} affiliate pid`);
  }

  if (!hasAffTemplate && !resolved.includes(`mcid=${EXPECTED_MCID}`)) {
    bad(`[${label}] Missing affiliate mcid in URL: ${url.slice(0, 80)}...`);
  } else {
    ok(`${label} affiliate mcid`);
  }

  if (!url.includes('viator.com/tours/')) {
    bad(`[${label}] URL missing /tours/ path: ${url.slice(0, 80)}...`);
  } else {
    ok(`${label} URL path`);
  }

  if (!url.includes('?')) {
    bad(`[${label}] URL missing ? before params: ${url.slice(0, 80)}...`);
  } else {
    ok(`${label} query separator`);
  }

  const urlProductCode = extractCodeFromViatorUrl(url);
  if (!urlProductCode) {
    bad(`[${label}] Could not extract product code from URL: ${url.slice(0, 80)}...`);
  } else if (expectedProductCode && urlProductCode !== expectedProductCode) {
    bad(
      `[${label}] productCode "${expectedProductCode}" does not match URL code "${urlProductCode}"`
    );
  } else {
    ok(`${label} product code matches URL`);
  }
}

function validateTourObject(objectText, label) {
  for (const field of TOUR_REQUIRED_FIELDS) {
    if (!hasField(objectText, field)) {
      bad(`[${label}] Missing required field: ${field}`);
    } else {
      ok(`${label} has ${field}`);
    }
  }

  const tier = extractStringField(objectText, 'tier');
  if (tier && !VALID_TIERS.has(tier)) {
    bad(`[${label}] Invalid tier: "${tier}"`);
  }

  const price = extractStringField(objectText, 'price');
  if (price && !/^\$\d+(?:\.\d{2})?$/.test(price) && price !== 'Self-guided') {
    notice(`[${label}] Unusual price format: "${price}" (expected $XX or Self-guided)`);
  }

  const rating = Number.parseFloat(extractStringField(objectText, 'rating') ?? '');
  if (!Number.isNaN(rating) && (rating < 1 || rating > 5)) {
    bad(`[${label}] Invalid rating: ${rating} (should be 1-5)`);
  }

  const productCode = extractStringField(objectText, 'productCode');
  const viatorUrl = extractStringField(objectText, 'viatorUrl');
  if (productCode && viatorUrl) {
    validateViatorUrl(viatorUrl, label, productCode);
  }
}

const viatorUrls = [
  ...cityToursRaw.matchAll(/viatorUrl:\s*[`'"](https:\/\/www\.viator\.com[^`'"]*)[`'"]/g),
];
console.log(`  Found ${viatorUrls.length} Viator URLs in cityTours.ts`);
for (const [, url] of viatorUrls) {
  validateViatorUrl(url, 'cityTours.ts raw URL');
}

// ── Parse city blocks to check tour completeness ──
const cityBlockPattern = /['"]([a-z-]+)['"]\s*:\s*\[/g;
const cityKeys = [];
let cityMatch;
while ((cityMatch = cityBlockPattern.exec(cityToursRaw)) !== null) {
  cityKeys.push(cityMatch[1]);
}
console.log(`  Found ${cityKeys.length} cities in CITY_TOURS\n`);

for (const city of cityKeys) {
  const cityStart =
    cityToursRaw.indexOf(`'${city}'`) !== -1
      ? cityToursRaw.indexOf(`'${city}'`)
      : cityToursRaw.indexOf(`"${city}"`);

  if (cityStart === -1) {
    continue;
  }

  const nextCityIdx = cityKeys.indexOf(city) + 1;
  const endIdx =
    nextCityIdx < cityKeys.length
      ? cityToursRaw.indexOf(`'${cityKeys[nextCityIdx]}'`) !== -1
        ? cityToursRaw.indexOf(`'${cityKeys[nextCityIdx]}'`)
        : cityToursRaw.indexOf(`"${cityKeys[nextCityIdx]}"`)
      : cityToursRaw.length;

  const cityBlock = cityToursRaw.slice(cityStart, endIdx);
  const tourObjects = extractTourObjects(cityBlock);
  const tiers = tourObjects
    .map((objectText) => extractStringField(objectText, 'tier'))
    .filter(Boolean);

  validateTierCoverage(tiers, city, { exactCount: 3 });
  tourObjects.forEach((objectText, index) => {
    validateTourObject(objectText, `${city} tour ${index + 1}`);
  });
}

// ── Also validate destination featured tours ──
const destPath = join(ROOT, 'src', 'data', 'destinations.ts');
try {
  const destRaw = readFileSync(destPath, 'utf-8');
  const featuredTourBlocks = [
    ...destRaw.matchAll(
      /slug:\s*'([^']+)'[\s\S]*?featuredTours:\s*\[([\s\S]*?)\],\s*\n\s*whyItMatters:/g
    ),
  ];

  if (featuredTourBlocks.length > 0) {
    console.log(`  Found ${featuredTourBlocks.length} destination featuredTours blocks`);
    for (const [, slug, block] of featuredTourBlocks) {
      const tourObjects = extractTourObjects(block);
      const tiers = tourObjects
        .map((objectText) => extractStringField(objectText, 'tier'))
        .filter(Boolean);

      validateTierCoverage(tiers, `destination:${slug}`, { minCount: 3 });
      tourObjects.forEach((objectText, index) => {
        validateTourObject(objectText, `destination:${slug} tour ${index + 1}`);
      });
    }
  } else {
    console.log('  No featuredTours blocks found in destinations.ts');
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
  errors.forEach((e) => console.log(e));
  console.log('');
}

if (warnings.length) {
  console.log('  WARNINGS:');
  warnings.forEach((w) => console.log(w));
  console.log('');
}

if (fail === 0) {
  console.log('  ✓ All tour & affiliate checks passed!\n');
} else {
  console.log(`  ✗ ${fail} issue(s) found — review before deploying.\n`);
  process.exit(1);
}
