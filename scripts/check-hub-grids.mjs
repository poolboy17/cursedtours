#!/usr/bin/env node
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

// Load all articles and group by primary category
const artDir = join(ROOT, 'src/data/articles');
const articles = readdirSync(artDir).filter(f => f.endsWith('.json')).map(f => {
  const d = JSON.parse(readFileSync(join(artDir, f), 'utf-8'));
  return { slug: d.slug, title: d.title, categories: d.categories?.map(c => c.slug) || [] };
});

// Map city slug → category slug → article slugs
// We need to match articles to hubs by checking which category has a city field
const artSrc = readFileSync(join(ROOT, 'src/data/articles.ts'), 'utf-8');

// Better parsing: extract each category block
const cityToCat = new Map(); // city → catSlug
const catBlock = artSrc.match(/export const CATEGORIES[^{]*(\{[\s\S]*?\n\};)/);
if (catBlock) {
  // Find each category entry with a city field
  const blockRe = /'([^']+)':\s*\{([\s\S]*?)\}/g;
  let bm;
  while ((bm = blockRe.exec(catBlock[1])) !== null) {
    const catKey = bm[1];
    const body = bm[2];
    const cityMatch = body.match(/city:\s*'([^']+)'/);
    if (cityMatch) {
      cityToCat.set(cityMatch[1], catKey);
    }
  }
}

// Count articles per category
const catArticles = new Map();
for (const a of articles) {
  for (const c of a.categories) {
    if (!catArticles.has(c)) catArticles.set(c, []);
    catArticles.get(c).push(a.slug);
  }
}

// Check each hub page
const hubPages = readdirSync(join(ROOT, 'src/pages'))
  .filter(f => f.endsWith('-ghost-tours.astro'));

console.log('Hub Article Grid Coverage:\n');
let anyMissing = false;
for (const file of hubPages.sort()) {
  const city = file.replace('-ghost-tours.astro', '');
  const content = readFileSync(join(ROOT, 'src/pages', file), 'utf-8');
  
  const catSlug = cityToCat.get(city);
  const totalArticles = catArticles.get(catSlug) || [];
  
  // Count article links in the hub page
  const articleLinkRe = /href="\/articles\/([^"]+)\/"/g;
  const linkedSlugs = new Set();
  let lm;
  while ((lm = articleLinkRe.exec(content)) !== null) {
    linkedSlugs.add(lm[1]);
  }
  
  const missing = totalArticles.filter(s => !linkedSlugs.has(s));
  const status = missing.length === 0 ? '✓' : '⚠';
  if (missing.length > 0) anyMissing = true;
  console.log(`${status} ${city}: ${linkedSlugs.size} linked / ${totalArticles.length} total${missing.length ? ` — MISSING: ${missing.join(', ')}` : ''}`);
}

if (!anyMissing) console.log('\n✓ All hubs display all their articles!');
