#!/usr/bin/env node
/**
 * Inject Contextual Cross-Links
 *
 * Finds the same 42 cross-link opportunities the audit script detects,
 * then wraps the FIRST unlinked mention of each keyword in an <a> tag.
 *
 * Usage:
 *   node scripts/inject-crosslinks.mjs --dry-run   # preview only
 *   node scripts/inject-crosslinks.mjs              # apply changes
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// ── Load articles ────────────────────────────────────────────────────
function loadArticles() {
  const dir = join(ROOT, 'src/data/articles');
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
      return { ...data, _file: f };
    });
}

// ── Key-phrase extraction (same logic as audit script) ───────────────
function extractKeyPhrases(title, slug) {
  const phrases = [];
  const segments = title.split(/[,:;&\-–—!?]+/);
  const connectors = /^(of|the|and|in|at|de|von|du|la|le|for|on|to|by|an|a)$/i;
  const notProperNouns = new Set([
    'haunts','beneath','behind','years','death','after','before',
    'inside','above','below','beyond','between','under','over',
    'night','dark','blood','fire','lost','last','first','city',
    'true','real','most','best','how','why','what','when','where',
    'haunted','hidden','complete','famous','walking','guide','places',
    'stories','legend','legends','ghosts','ghost','history','execution',
    'shining','inspiration','causes','consequences','lasting','legacy',
  ]);
  const stopW = new Set(['the','of','in','at','and','a','an','to','for','on','by']);

  for (const seg of segments) {
    const words = seg.trim().split(/\s+/);
    let current = [];
    for (const w of words) {
      if (/^[A-Z]/.test(w)) { current.push(w); }
      else if (connectors.test(w) && current.length > 0) { current.push(w); }
      else {
        if (current.length >= 2) {
          while (current.length && connectors.test(current[current.length - 1])) current.pop();
          if (current.length >= 2) {
            const phrase = current.join(' ').toLowerCase();
            const meaningful = phrase.split(/\s+/).filter(w2 => !stopW.has(w2) && !notProperNouns.has(w2.replace(/[''s]+$/i, '')));
            if (meaningful.length >= 2 && phrase.length >= 10) phrases.push(phrase);
          }
        }
        current = [];
      }
    }
    if (current.length >= 2) {
      while (current.length && connectors.test(current[current.length - 1])) current.pop();
      if (current.length >= 2) {
        const phrase = current.join(' ').toLowerCase();
        const meaningful = phrase.split(/\s+/).filter(w2 => !stopW.has(w2) && !notProperNouns.has(w2.replace(/[''s]+$/i, '')));
        if (meaningful.length >= 2 && phrase.length >= 10) phrases.push(phrase);
      }
    }
  }
  return [...new Set(phrases)];
}

// ── Extract internal links from HTML ─────────────────────────────────
function extractInternalLinks(html) {
  const links = new Set();
  const re = /href="(\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    links.add(m[1].replace(/\/$/, '') + '/');
  }
  return links;
}

// ── Find cross-link opportunities (same logic as audit) ──────────────
function findOpportunities(articles) {
  const opportunities = [];
  const stopWords = new Set(['the','of','in','at','and','a','an','to','for','on','by']);

  // Build phrase→article mapping
  const phraseMap = new Map();
  for (const a of articles) {
    const url = `/articles/${a.slug}/`;
    const phrases = extractKeyPhrases(a.title, a.slug);
    for (const phrase of phrases) {
      if (!phraseMap.has(phrase)) phraseMap.set(phrase, []);
      phraseMap.get(phrase).push({ slug: a.slug, title: a.title, url });
    }
  }

  // Also add keywords
  for (const a of articles) {
    const url = `/articles/${a.slug}/`;
    if (a.keywords) {
      for (const kw of a.keywords) {
        const kwLower = kw.toLowerCase();
        if (kwLower.length < 6) continue;
        if (!phraseMap.has(kwLower)) phraseMap.set(kwLower, []);
        const existing = phraseMap.get(kwLower);
        if (!existing.some(e => e.slug === a.slug)) {
          existing.push({ slug: a.slug, title: a.title, url });
        }
      }
    }
  }

  // For each article, check if it mentions phrases linked to other articles
  for (const article of articles) {
    const rawContent = article.content || '';
    const strippedContent = rawContent.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '').toLowerCase();
    const existingLinks = extractInternalLinks(rawContent);

    for (const [phrase, targets] of phraseMap) {
      if (phrase.length < 10) continue;

      const isProperPhrase = targets.some(t => {
        const words = phrase.split(' ');
        const meaningfulWords = words.filter(w => !stopWords.has(w));
        if (meaningfulWords.length < 2) return false;
        const capCount = meaningfulWords.filter(w => {
          const idx = t.title.toLowerCase().indexOf(w);
          return idx >= 0 && /[A-Z]/.test(t.title.charAt(idx));
        }).length;
        return capCount >= 2;
      });
      if (!isProperPhrase) continue;

      for (const target of targets) {
        if (target.slug === article.slug) continue;
        if (existingLinks.has(target.url)) continue;

        if (strippedContent.includes(phrase)) {
          opportunities.push({
            sourceSlug: article.slug,
            sourceFile: article._file,
            targetSlug: target.slug,
            targetUrl: target.url,
            targetTitle: target.title,
            keyword: phrase,
          });
          break; // One match per target per article
        }
      }
    }
  }

  return opportunities;
}

// ── Inject a single cross-link into article HTML ─────────────────────
function injectLink(html, keyword, targetUrl, targetTitle) {
  // Find the FIRST occurrence of the keyword that is NOT inside an <a> tag
  // Strategy: split on anchor tags, process only non-anchor segments
  const parts = html.split(/(<a[^>]*>[\s\S]*?<\/a>)/gi);
  let injected = false;

  for (let i = 0; i < parts.length; i++) {
    // Skip anchor tag segments (odd indices from split)
    if (parts[i].match(/^<a[^>]*>/i)) continue;

    // Also skip if we're inside a heading tag
    // We want to link in paragraph text, not headings
    const segment = parts[i];

    // Case-insensitive search for the keyword
    const lowerSeg = segment.toLowerCase();
    const idx = lowerSeg.indexOf(keyword.toLowerCase());
    if (idx === -1) continue;

    // Check we're not inside an HTML tag attribute
    const before = segment.substring(0, idx);
    const openTag = before.lastIndexOf('<');
    const closeTag = before.lastIndexOf('>');
    if (openTag > closeTag) continue; // inside a tag

    // Check we're not inside a heading
    const lastH = before.match(/<h[1-6][^>]*>[^<]*$/i);
    if (lastH) continue;

    // Extract the exact-case text from the original
    const exactText = segment.substring(idx, idx + keyword.length);

    // Wrap in anchor tag
    const linked = `<a href="${targetUrl}">${exactText}</a>`;
    parts[i] = segment.substring(0, idx) + linked + segment.substring(idx + keyword.length);
    injected = true;
    break;
  }

  return injected ? parts.join('') : null;
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(' Cursed Tours — Cross-Link Injection');
  console.log(` ${new Date().toISOString()}  ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'}`);
  console.log('═══════════════════════════════════════════════════════\n');

  const articles = loadArticles();
  console.log(`Loaded ${articles.length} articles\n`);

  // Find all cross-link opportunities (same logic as audit)
  const opportunities = findOpportunities(articles);
  console.log(`Found ${opportunities.length} cross-link opportunities\n`);

  // Group by source article for efficient file I/O
  const bySource = new Map();
  for (const opp of opportunities) {
    if (!bySource.has(opp.sourceSlug)) bySource.set(opp.sourceSlug, []);
    bySource.get(opp.sourceSlug).push(opp);
  }

  let injected = 0;
  let skipped = 0;
  const changes = []; // track what we changed

  for (const [sourceSlug, opps] of bySource) {
    const filePath = join(ROOT, 'src/data/articles', opps[0].sourceFile);
    const fullData = JSON.parse(readFileSync(filePath, 'utf-8'));
    let content = fullData.content;
    let modified = false;

    for (const opp of opps) {
      // Double-check: does source already link to target?
      const existingLinks = extractInternalLinks(content);
      if (existingLinks.has(opp.targetUrl)) {
        console.log(`  SKIP: ${sourceSlug} already links to ${opp.targetSlug}`);
        skipped++;
        continue;
      }

      const result = injectLink(content, opp.keyword, opp.targetUrl, opp.targetTitle);
      if (result) {
        content = result;
        modified = true;
        injected++;
        changes.push({
          source: sourceSlug,
          target: opp.targetSlug,
          keyword: opp.keyword,
        });
        console.log(`  ✓ "${sourceSlug}" → "${opp.keyword}" → /articles/${opp.targetSlug}/`);
      } else {
        console.log(`  ✗ "${sourceSlug}": could not find safe injection point for "${opp.keyword}"`);
        skipped++;
      }
    }

    if (modified && !DRY_RUN) {
      fullData.content = content;
      writeFileSync(filePath, JSON.stringify(fullData, null, 2) + '\n');
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(` ${DRY_RUN ? 'Would inject' : 'Injected'}: ${injected} cross-links`);
  console.log(` Skipped: ${skipped}`);
  console.log(` Files modified: ${bySource.size}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (changes.length) {
    console.log('Changes:');
    for (const c of changes) {
      console.log(`  ${c.source} → "${c.keyword}" → ${c.target}`);
    }
  }
}

main();
