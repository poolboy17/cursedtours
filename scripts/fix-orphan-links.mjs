#!/usr/bin/env node
/**
 * Fix Orphaned Articles — Add Reciprocal Links
 *
 * For each of the 41 articles with only 1 inbound link, finds 1-2 sibling
 * articles (same category) that don't already link to the orphan, then
 * inserts a link into those siblings' "Continue Reading" <ul> blocks.
 *
 * Usage:
 *   node scripts/fix-orphan-links.mjs --dry-run   # preview only
 *   node scripts/fix-orphan-links.mjs              # apply changes
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// ── Load data ────────────────────────────────────────────────────────
function loadArticles() {
  const dir = join(ROOT, 'src/data/articles');
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
      return { ...data, _file: f };
    });
}

function extractInternalLinks(html) {
  const links = new Set();
  const re = /href="(\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    links.add(m[1].replace(/\/$/, '') + '/');
  }
  return links;
}

function buildInboundMap(articles) {
  const inbound = new Map(); // url → Set of source urls
  for (const a of articles) {
    const url = `/articles/${a.slug}/`;
    if (!inbound.has(url)) inbound.set(url, new Set());
  }
  for (const a of articles) {
    const sourceUrl = `/articles/${a.slug}/`;
    const links = extractInternalLinks(a.content || '');
    for (const link of links) {
      if (!inbound.has(link)) inbound.set(link, new Set());
      inbound.get(link).add(sourceUrl);
    }
  }
  return inbound;
}

// ── Find orphans (articles with only 1 inbound from articles) ────────
function findOrphans(articles, inbound) {
  const orphans = [];
  for (const a of articles) {
    const url = `/articles/${a.slug}/`;
    const sources = inbound.get(url);
    const count = sources ? sources.size : 0;
    if (count <= 1) {
      orphans.push({
        slug: a.slug,
        title: a.title,
        file: a._file,
        categories: a.categories.map(c => c.slug),
        inboundCount: count,
      });
    }
  }
  return orphans;
}

// ── Find sibling articles that could link to the orphan ──────────────
function findDonors(orphan, articles, inbound) {
  // Find articles in the same category that DON'T already link to the orphan
  const orphanUrl = `/articles/${orphan.slug}/`;
  const siblings = articles.filter(a => {
    if (a.slug === orphan.slug) return false;
    // Must share at least one category
    const aCats = a.categories.map(c => c.slug);
    const shared = orphan.categories.some(c => aCats.includes(c));
    if (!shared) return false;
    // Must NOT already link to orphan
    const links = extractInternalLinks(a.content || '');
    if (links.has(orphanUrl)) return false;
    // Must have a Continue Reading section (safer injection point)
    if (!a.content || !a.content.includes('Continue Reading')) return false;
    return true;
  });

  // Prefer siblings with more inbound links themselves (stronger pages)
  siblings.sort((a, b) => {
    const aIn = inbound.get(`/articles/${a.slug}/`)?.size || 0;
    const bIn = inbound.get(`/articles/${b.slug}/`)?.size || 0;
    return bIn - aIn; // higher inbound first
  });

  return siblings.slice(0, 2); // max 2 donors per orphan
}

// ── Insert link into Continue Reading section ────────────────────────
function insertContinueReadingLink(content, targetSlug, targetTitle) {
  const targetUrl = `/articles/${targetSlug}/`;
  const linkHtml = `<li><a href="${targetUrl}">${targetTitle}</a></li>`;

  // Find the Continue Reading <ul> and insert at end (before </ul>)
  const crMatch = content.match(/<h3>Continue Reading<\/h3>\s*<ul>([\s\S]*?)<\/ul>/i);
  if (!crMatch) return null;

  const ulStart = content.indexOf(crMatch[0]);
  const ulEnd = ulStart + crMatch[0].length;
  const closingUl = crMatch[0].lastIndexOf('</ul>');

  const before = crMatch[0].substring(0, closingUl);
  const after = crMatch[0].substring(closingUl);

  const updated = before + '\n' + linkHtml + '\n' + after;
  return content.substring(0, ulStart) + updated + content.substring(ulEnd);
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(' Cursed Tours — Orphan Link Fixer');
  console.log(` ${new Date().toISOString()}  ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'}`);
  console.log('═══════════════════════════════════════════════════════\n');

  const articles = loadArticles();
  const inbound = buildInboundMap(articles);
  console.log(`Loaded ${articles.length} articles\n`);

  const orphans = findOrphans(articles, inbound);
  console.log(`Found ${orphans.length} orphaned articles (≤1 inbound)\n`);

  // Track which files we need to write back
  const modifiedFiles = new Map(); // file → updated fullData

  let totalLinksAdded = 0;
  let orphansFixed = 0;
  let orphansSkipped = 0;

  for (const orphan of orphans) {
    const donors = findDonors(orphan, articles, inbound);
    if (donors.length === 0) {
      console.log(`  ✗ ${orphan.slug}: no eligible sibling donors found`);
      orphansSkipped++;
      continue;
    }

    orphansFixed++;
    for (const donor of donors) {
      // Get current content (may have been modified already)
      let fullData;
      if (modifiedFiles.has(donor._file)) {
        fullData = modifiedFiles.get(donor._file);
      } else {
        const filePath = join(ROOT, 'src/data/articles', donor._file);
        fullData = JSON.parse(readFileSync(filePath, 'utf-8'));
      }

      const result = insertContinueReadingLink(fullData.content, orphan.slug, orphan.title);
      if (result) {
        fullData.content = result;
        modifiedFiles.set(donor._file, fullData);
        totalLinksAdded++;
        console.log(`  ✓ ${donor.slug} → now links to → ${orphan.slug}`);
      } else {
        console.log(`  ✗ ${donor.slug}: could not inject link for ${orphan.slug}`);
      }
    }
  }

  // Write all modified files
  if (!DRY_RUN) {
    for (const [file, data] of modifiedFiles) {
      const filePath = join(ROOT, 'src/data/articles', file);
      writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(` ${DRY_RUN ? 'Would add' : 'Added'}: ${totalLinksAdded} reciprocal links`);
  console.log(` Orphans fixed: ${orphansFixed}/${orphans.length}`);
  console.log(` Orphans skipped (no donors): ${orphansSkipped}`);
  console.log(` Files modified: ${modifiedFiles.size}`);
  console.log('═══════════════════════════════════════════════════════');
}

main();
