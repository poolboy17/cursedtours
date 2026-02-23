/**
 * Rebalance Hub CTA Cross-Links
 * Replaces the 3 pill links in each hub's CTA section with a balanced distribution.
 * Every hub gets 2-4 inbound links from other hubs (vs 0-11 currently).
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const PAGES_DIR = join(process.cwd(), 'src', 'pages');

// City slug → display name mapping
const CITIES = {
  'austin': 'Austin',
  'boston': 'Boston',
  'charleston': 'Charleston',
  'chicago': 'Chicago',
  'denver': 'Denver',
  'dublin': 'Dublin',
  'edinburgh': 'Edinburgh',
  'key-west': 'Key West',
  'london': 'London',
  'nashville': 'Nashville',
  'new-orleans': 'New Orleans',
  'new-york': 'New York',
  'paris': 'Paris',
  'rome': 'Rome',
  'salem': 'Salem',
  'san-antonio': 'San Antonio',
  'savannah': 'Savannah',
  'st-augustine': 'St. Augustine',
  'washington-dc': 'Washington DC',
};

// Balanced linking strategy: geographic/thematic clusters
const LINK_MAP = {
  'austin':        ['san-antonio', 'nashville', 'denver'],
  'boston':         ['salem', 'new-york', 'edinburgh'],
  'charleston':    ['savannah', 'st-augustine', 'new-orleans'],
  'chicago':       ['nashville', 'boston', 'denver'],
  'denver':        ['chicago', 'austin', 'san-antonio'],
  'dublin':        ['edinburgh', 'london', 'boston'],
  'edinburgh':     ['dublin', 'london', 'paris'],
  'key-west':      ['st-augustine', 'savannah', 'new-orleans'],
  'london':        ['edinburgh', 'paris', 'rome'],
  'nashville':     ['charleston', 'austin', 'chicago'],
  'new-orleans':   ['savannah', 'charleston', 'key-west'],
  'new-york':      ['boston', 'washington-dc', 'london'],
  'paris':         ['rome', 'london', 'dublin'],
  'rome':          ['paris', 'edinburgh', 'london'],
  'salem':         ['boston', 'new-york', 'washington-dc'],
  'san-antonio':   ['austin', 'new-orleans', 'denver'],
  'savannah':      ['charleston', 'new-orleans', 'st-augustine'],
  'st-augustine':  ['key-west', 'charleston', 'savannah'],
  'washington-dc': ['new-york', 'boston', 'charleston'],
};

// Verify balance before running
console.log('=== Inbound Link Distribution ===');
const inbound = {};
for (const city of Object.keys(CITIES)) inbound[city] = 0;
for (const [from, targets] of Object.entries(LINK_MAP)) {
  for (const to of targets) {
    inbound[to] = (inbound[to] || 0) + 1;
  }
}
for (const [city, count] of Object.entries(inbound).sort((a, b) => a[1] - b[1])) {
  console.log(`  ${CITIES[city]}: ${count} inbound`);
}
console.log('');

// Pill link HTML template
function makePill(slug) {
  const name = CITIES[slug];
  return `        <a href="/${slug}-ghost-tours/" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105" style="border: 1px solid #3d2a4d; background: rgba(26,16,37,0.3); color: #c8bdd8;" onmouseenter="this.style.borderColor='#a855f7';this.style.color='#fff'" onmouseleave="this.style.borderColor='#3d2a4d';this.style.color='#c8bdd8'">${name}<svg class="w-3.5 h-3.5" style="color:#7a6b8a;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></a>`;
}

// Process each hub page
const hubFiles = readdirSync(PAGES_DIR)
  .filter(f => f.endsWith('-ghost-tours.astro'))
  .map(f => join(PAGES_DIR, f));

console.log(`Found ${hubFiles.length} hub pages.\n`);

let successCount = 0;

for (const filePath of hubFiles) {
  const filename = filePath.split(/[/\\]/).pop();
  // Extract city slug from filename: austin-ghost-tours.astro → austin
  const citySlug = filename.replace('-ghost-tours.astro', '');
  
  const targets = LINK_MAP[citySlug];
  if (!targets) {
    console.log(`⚠ ${filename}: No link mapping found for "${citySlug}"`);
    continue;
  }

  let content = readFileSync(filePath, 'utf-8');

  // Match the pill links container: <div class="flex flex-wrap justify-center gap-2">...pills...</div>
  // inside the CTA section (identified by "More Haunted Cities" heading)
  const ctaPillsRegex = /(<div class="flex flex-wrap justify-center gap-2">\s*\n)([\s\S]*?)(\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<\/section>\s*\n<\/Layout>)/;

  const match = content.match(ctaPillsRegex);
  if (!match) {
    console.log(`⚠ ${filename}: CTA pills regex didn't match`);
    continue;
  }

  // Build new pill links
  const newPills = targets.map(slug => makePill(slug)).join('\n');
  
  const oldCities = [...match[2].matchAll(/>([^<]+)<svg/g)].map(m => m[1]).join(', ');
  const newCities = targets.map(s => CITIES[s]).join(', ');

  content = content.replace(ctaPillsRegex, `$1${newPills}\n$3`);
  
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ ${filename}: ${oldCities} → ${newCities}`);
  successCount++;
}

console.log(`\n========================================`);
console.log(`Done! ${successCount} hub pages updated.`);
console.log(`========================================`);
