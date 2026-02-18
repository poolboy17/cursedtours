#!/usr/bin/env node
/**
 * Internal Linking Audit & Auto-Fix for Cursed Tours
 * 
 * Runs daily to:
 * 1. Map the full site link graph
 * 2. Check hub→spoke and spoke→hub integrity
 * 3. Find cross-linking opportunities
 * 4. Detect orphan pages (few/no inbound links)
 * 5. Auto-fix by inserting missing links into article content
 *
 * Usage:
 *   node scripts/internal-linking-audit.mjs          # audit + auto-fix
 *   node scripts/internal-linking-audit.mjs --dry-run # audit only, no changes
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// ── 1. Load all data ─────────────────────────────────────────────────
function loadArticles() {
  const dir = join(ROOT, 'src/data/articles');
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
      return { ...data, _file: f };
    });
}

function loadCategories() {
  // Parse CATEGORIES from articles.ts
  const src = readFileSync(join(ROOT, 'src/data/articles.ts'), 'utf-8');
  const cats = {};
  const catBlock = src.match(/export const CATEGORIES[^{]*(\{[\s\S]*?\n\};)/);
  if (!catBlock) return cats;
  // Simple regex extraction of category entries
  const entryRe = /'([^']+)':\s*\{[^}]*slug:\s*'([^']+)'[^}]*type:\s*'([^']+)'[^}]*(?:hubPage:\s*'([^']+)')?[^}]*(?:city:\s*'([^']+)')?/g;
  let m;
  while ((m = entryRe.exec(catBlock[1])) !== null) {
    cats[m[1]] = { slug: m[2], type: m[3], hubPage: m[4] || null, city: m[5] || null };
  }
  return cats;
}

function loadDestinations() {
  const src = readFileSync(join(ROOT, 'src/data/destinations.ts'), 'utf-8');
  const dests = {};
  // Extract slug and relatedArticleSlugs for each destination
  const destRe = /'([^']+)':\s*\{[^]*?slug:\s*'([^']+)'/g;
  let m;
  while ((m = destRe.exec(src)) !== null) {
    const key = m[1];
    // Find relatedArticleSlugs array for this destination
    const afterKey = src.indexOf(`'${key}':`);
    const nextDest = src.indexOf("\n\t'", afterKey + 10);
    const block = src.substring(afterKey, nextDest > 0 ? nextDest : undefined);
    const articleSlugs = [];
    const slugMatch = block.match(/relatedArticleSlugs:\s*\[([\s\S]*?)\]/);
    if (slugMatch) {
      const inner = slugMatch[1];
      const re2 = /'([^']+)'/g;
      let s;
      while ((s = re2.exec(inner)) !== null) articleSlugs.push(s[1]);
    }
    dests[key] = { slug: key, articleSlugs };
  }
  return dests;
}

function loadBlogHubs() {
  const src = readFileSync(join(ROOT, 'src/data/blogHubs.ts'), 'utf-8');
  const hubs = {};
  const hubRe = /'([^']+)':\s*\{[^]*?slug:\s*'([^']+)'[^]*?categorySlug:\s*'([^']+)'/g;
  let m;
  while ((m = hubRe.exec(src)) !== null) {
    hubs[m[1]] = { slug: m[2], categorySlug: m[3] };
  }
  return hubs;
}

// ── 2. Extract links from content ────────────────────────────────────
function extractInternalLinks(html) {
  const links = new Set();
  const re = /href="(\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    links.add(m[1].replace(/\/$/, '') + '/');
  }
  return links;
}

// Build list of all known internal URLs
function buildSiteMap(articles, categories, destinations) {
  const pages = new Map(); // url → { type, slug, title }

  // Homepage
  pages.set('/', { type: 'home', slug: 'home', title: 'Home' });

  // City hub pages
  const cityHubFiles = readdirSync(join(ROOT, 'src/pages'))
    .filter(f => f.endsWith('-ghost-tours.astro'));
  for (const f of cityHubFiles) {
    const slug = f.replace('.astro', '');
    pages.set(`/${slug}/`, { type: 'city-hub', slug, title: slug });
  }

  // Destination pages
  for (const [key, dest] of Object.entries(destinations)) {
    pages.set(`/destinations/${dest.slug}/`, { type: 'destination', slug: dest.slug, title: key });
  }

  // Experience pages
  const expFiles = readdirSync(join(ROOT, 'src/pages/experiences'))
    .filter(f => f.endsWith('.astro') && f !== 'index.astro' && !f.startsWith('['));
  for (const f of expFiles) {
    const slug = f.replace('.astro', '');
    pages.set(`/experiences/${slug}/`, { type: 'experience', slug, title: slug });
  }

  // Blog hub pages
  pages.set('/blog/', { type: 'blog-index', slug: 'blog', title: 'Blog' });
  // Blog hub slugs come from blogHubs data (slug field)
  const blogHubs = loadBlogHubs();
  for (const [, hub] of Object.entries(blogHubs)) {
    pages.set(`/blog/${hub.slug}/`, { type: 'blog-hub', slug: hub.slug, title: hub.slug });
  }

  // Article pages
  for (const a of articles) {
    pages.set(`/articles/${a.slug}/`, { type: 'article', slug: a.slug, title: a.title });
  }

  // Utility pages
  for (const slug of ['contact', 'terms', 'privacy-policy', 'editorial-policy', 'about', 'articles']) {
    if (existsSync(join(ROOT, `src/pages/${slug}.astro`))) {
      pages.set(`/${slug}/`, { type: 'utility', slug, title: slug });
    }
  }

  return pages;
}

// ── 3. Build link graph ──────────────────────────────────────────────
function buildLinkGraph(articles, siteMap) {
  // outbound: url → Set of urls it links to
  // inbound:  url → Set of urls that link to it
  const outbound = new Map();
  const inbound = new Map();

  for (const [url] of siteMap) {
    outbound.set(url, new Set());
    inbound.set(url, new Set());
  }

  // Article content links
  for (const a of articles) {
    const url = `/articles/${a.slug}/`;
    const links = extractInternalLinks(a.content || '');
    for (const link of links) {
      if (!outbound.has(url)) outbound.set(url, new Set());
      outbound.get(url).add(link);
      if (!inbound.has(link)) inbound.set(link, new Set());
      inbound.get(link).add(url);
    }
  }

  // TODO: Also parse .astro page files for links (city hubs, destinations, etc.)
  // For now we focus on article↔hub relationships which are data-driven

  return { outbound, inbound };
}

// ── 4. Hub-Spoke Integrity Checks ────────────────────────────────────
function checkHubSpoke(articles, categories, blogHubs) {
  const issues = [];

  for (const article of articles) {
    const cat = article.categories?.[0];
    if (!cat) {
      issues.push({ type: 'NO_CATEGORY', article: article.slug, message: 'Article has no category assigned' });
      continue;
    }

    const catInfo = categories[cat.slug];
    if (!catInfo) continue;

    const hubPage = catInfo.hubPage;
    if (!hubPage) continue;

    const articleUrl = `/articles/${article.slug}/`;
    const links = extractInternalLinks(article.content || '');

    // Check spoke→hub: does the article link back to its hub?
    const normalizedHub = hubPage.replace(/\/$/, '') + '/';
    const linksToHub = [...links].some(l => l === normalizedHub);

    if (!linksToHub) {
      issues.push({
        type: 'SPOKE_MISSING_HUB_LINK',
        article: article.slug,
        hub: hubPage,
        category: cat.slug,
        message: `Article does not link back to its hub page ${hubPage}`,
        fixable: true,
      });
    }
  }

  return issues;
}

// ── 5. Cross-Linking Opportunities ───────────────────────────────────
function extractKeyPhrases(title, slug) {
  // Extract meaningful proper nouns and phrases from article titles
  // These are the terms other articles might mention without linking
  const phrases = [];

  // Extract proper noun phrases by splitting on punctuation, then finding
  // sequences of capitalized words (with connectors like "of", "the" between)
  const segments = title.split(/[,:;&\-–—!?]+/);
  const connectors = /^(of|the|and|in|at|de|von|du|la|le|for|on|to|by|an|a)$/i;
  const notProperNouns = new Set([
    'haunts', 'beneath', 'behind', 'years', 'death', 'after', 'before',
    'inside', 'above', 'below', 'beyond', 'between', 'under', 'over',
    'night', 'dark', 'blood', 'fire', 'lost', 'last', 'first', 'city',
    'true', 'real', 'most', 'best', 'how', 'why', 'what', 'when', 'where',
    'haunted', 'hidden', 'complete', 'famous', 'walking', 'guide', 'places',
    'stories', 'legend', 'legends', 'ghosts', 'ghost', 'history', 'execution',
    'shining', 'inspiration', 'causes', 'consequences', 'lasting', 'legacy',
  ]);
  const stopW = new Set(['the', 'of', 'in', 'at', 'and', 'a', 'an', 'to', 'for', 'on', 'by']);

  for (const seg of segments) {
    const words = seg.trim().split(/\s+/);
    let current = [];
    for (const w of words) {
      const clean = w.replace(/[''s]+$/i, '');
      if (/^[A-Z]/.test(w)) {
        current.push(w);
      } else if (connectors.test(w) && current.length > 0) {
        current.push(w);
      } else {
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

  // Single notable proper nouns (from slug, filtering generic words)
  const genericWords = new Set([
    'history', 'haunted', 'ghost', 'stories', 'complete', 'guide', 'true',
    'story', 'most', 'places', 'dark', 'tours', 'best', 'real', 'famous',
    'what', 'expect', 'culture', 'legends', 'legend', 'mystery', 'hidden',
    'american', 'chicago', 'london', 'boston', 'austin', 'denver', 'dublin',
    'nashville', 'charleston', 'savannah', 'edinburgh', 'paris', 'rome',
    'orleans', 'antonio', 'augustine', 'york', 'washington',
    'walking', 'evidence', 'archive', 'paranormal', 'investigations',
    'building', 'hotel', 'house', 'church', 'castle', 'cemetery', 'prison',
    'museum', 'mansion', 'graveyard', 'military', 'hospital', 'lighthouse',
    'interview', 'phantom', 'folklore', 'believe', 'accused', 'solitary',
    'locations', 'filming', 'gangster', 'eastern', 'western', 'northern',
    'southern', 'prisons', 'historical', 'colonial', 'civil', 'bodies',
  ]);
  // Don't use single slug words — too many false positives

  return [...new Set(phrases)];
}

function findCrossLinkOpportunities(articles, siteMap) {
  const issues = [];

  // Build phrase→article mapping
  const phraseMap = new Map(); // phrase → { slug, title, url }
  for (const a of articles) {
    const url = `/articles/${a.slug}/`;
    const phrases = extractKeyPhrases(a.title, a.slug);
    for (const phrase of phrases) {
      if (!phraseMap.has(phrase)) phraseMap.set(phrase, []);
      phraseMap.get(phrase).push({ slug: a.slug, title: a.title, url });
    }
  }

  // Also add keywords from article data
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
    // Strip existing anchor tags to avoid matching inside them
    const strippedContent = rawContent.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '').toLowerCase();
    const existingLinks = extractInternalLinks(rawContent);

    for (const [phrase, targets] of phraseMap) {
      if (phrase.length < 10) continue;
      // Only match phrases where EVERY word (except articles/prepositions) is
      // capitalized in the original title — i.e. it's a proper noun phrase
      const stopWords = new Set(['the', 'of', 'in', 'at', 'and', 'a', 'an', 'to', 'for', 'on', 'by']);
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
        // Skip self-references
        if (target.slug === article.slug) continue;
        // Skip if already linked
        if (existingLinks.has(target.url)) continue;

        if (strippedContent.includes(phrase)) {
          issues.push({
            type: 'CROSS_LINK_OPPORTUNITY',
            article: article.slug,
            target: target.slug,
            keyword: phrase,
            message: `"${article.slug}" mentions "${phrase}" but doesn't link to /articles/${target.slug}/`,
            fixable: false,
          });
          break; // One match per target per article is enough
        }
      }
    }
  }

  return issues;
}

// ── 6. Orphan Page Detection ─────────────────────────────────────────
function findOrphans(articles, inboundMap) {
  const issues = [];

  for (const article of articles) {
    const url = `/articles/${article.slug}/`;
    const inboundLinks = inboundMap.get(url);
    const count = inboundLinks ? inboundLinks.size : 0;

    if (count === 0) {
      issues.push({
        type: 'ORPHAN_ZERO_INBOUND',
        article: article.slug,
        message: `Article has ZERO inbound internal links — completely orphaned`,
        fixable: false,
      });
    } else if (count === 1) {
      issues.push({
        type: 'ORPHAN_LOW_INBOUND',
        article: article.slug,
        inboundCount: count,
        sources: [...inboundLinks],
        message: `Article has only 1 inbound internal link`,
        fixable: false,
      });
    }
  }

  return issues;
}

// ── 7. Auto-Fix: Insert missing hub links ────────────────────────────
function autoFixHubLinks(articles, issues, categories) {
  const fixes = [];
  const spokeIssues = issues.filter(i => i.type === 'SPOKE_MISSING_HUB_LINK' && i.fixable);

  for (const issue of spokeIssues) {
    const article = articles.find(a => a.slug === issue.article);
    if (!article) continue;

    const catInfo = categories[issue.category];
    if (!catInfo) continue;

    const hubUrl = issue.hub;
    const hubName = catInfo.city
      ? `${catInfo.city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Ghost Tours`
      : issue.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Strategy: Add hub link to the "Continue Reading" section if it exists,
    // otherwise append a Continue Reading section at the end
    let content = article.content;
    const continueReadingMatch = content.match(/<h3>Continue Reading<\/h3>\s*<ul>/i);

    if (continueReadingMatch) {
      // Insert at the top of the Continue Reading list
      const insertPoint = content.indexOf('<ul>', content.indexOf(continueReadingMatch[0]));
      const linkHtml = `\n<li><a href="${hubUrl}">${hubName}</a></li>`;
      content = content.slice(0, insertPoint + 4) + linkHtml + content.slice(insertPoint + 4);
    } else {
      // Append a new Continue Reading section
      content += `\n\n<hr />\n\n<h3>Continue Reading</h3>\n<ul>\n<li><a href="${hubUrl}">${hubName}</a></li>\n</ul>`;
    }

    if (!DRY_RUN) {
      // Write updated content back to the JSON file
      const filePath = join(ROOT, 'src/data/articles', article._file);
      const fullData = JSON.parse(readFileSync(filePath, 'utf-8'));
      fullData.content = content;
      writeFileSync(filePath, JSON.stringify(fullData, null, 2) + '\n');
    }

    fixes.push({
      article: article.slug,
      hub: hubUrl,
      action: continueReadingMatch ? 'added_to_continue_reading' : 'created_continue_reading',
    });
  }

  return fixes;
}

// ── 8. Main ──────────────────────────────────────────────────────────
function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(' Cursed Tours — Internal Linking Audit');
  console.log(` ${new Date().toISOString()}  ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // Load data
  const articles = loadArticles();
  const categories = loadCategories();
  const destinations = loadDestinations();
  const blogHubs = loadBlogHubs();

  console.log(`Loaded: ${articles.length} articles, ${Object.keys(categories).length} categories, ${Object.keys(destinations).length} destinations, ${Object.keys(blogHubs).length} blog hubs\n`);

  // Build site map and link graph
  const siteMap = buildSiteMap(articles, categories, destinations);
  const { outbound, inbound } = buildLinkGraph(articles, siteMap);

  console.log(`Site map: ${siteMap.size} total pages`);
  console.log(`Link graph: ${[...outbound.values()].reduce((s, v) => s + v.size, 0)} outbound links tracked\n`);

  // Run checks
  const hubSpokeIssues = checkHubSpoke(articles, categories, blogHubs);
  const crossLinkIssues = findCrossLinkOpportunities(articles, siteMap);
  const orphanIssues = findOrphans(articles, inbound);

  // Report hub-spoke issues
  console.log('─── Hub-Spoke Integrity ─────────────────────────────');
  const spokeIssues = hubSpokeIssues.filter(i => i.type === 'SPOKE_MISSING_HUB_LINK');
  const noCatIssues = hubSpokeIssues.filter(i => i.type === 'NO_CATEGORY');
  if (noCatIssues.length) {
    console.log(`\n⚠  ${noCatIssues.length} articles with no category:`);
    noCatIssues.forEach(i => console.log(`   - ${i.article}`));
  }
  if (spokeIssues.length) {
    console.log(`\n✗  ${spokeIssues.length} articles missing link to their hub:`);
    spokeIssues.forEach(i => console.log(`   - ${i.article} → should link to ${i.hub}`));
  } else {
    console.log('\n✓  All articles link back to their hub page');
  }

  // Report orphans
  console.log('\n─── Orphan Detection ───────────────────────────────');
  const zeroInbound = orphanIssues.filter(i => i.type === 'ORPHAN_ZERO_INBOUND');
  const lowInbound = orphanIssues.filter(i => i.type === 'ORPHAN_LOW_INBOUND');
  if (zeroInbound.length) {
    console.log(`\n✗  ${zeroInbound.length} articles with ZERO inbound links (orphans):`);
    zeroInbound.forEach(i => console.log(`   - ${i.article}`));
  }
  if (lowInbound.length) {
    console.log(`\n⚠  ${lowInbound.length} articles with only 1 inbound link:`);
    lowInbound.forEach(i => console.log(`   - ${i.article} ← from ${i.sources[0]}`));
  }
  if (!zeroInbound.length && !lowInbound.length) {
    console.log('\n✓  No orphan articles detected');
  }

  // Report cross-link opportunities (top 20 most impactful)
  console.log('\n─── Cross-Linking Opportunities (top 20) ───────────');
  if (crossLinkIssues.length) {
    // Dedupe by article+target pair, keep first
    const seen = new Set();
    const deduped = crossLinkIssues.filter(i => {
      const key = `${i.article}→${i.target}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    console.log(`\n${deduped.length} total opportunities found (showing top 20):`);
    deduped.slice(0, 20).forEach(i =>
      console.log(`   - "${i.article}" mentions "${i.keyword}" → link to /articles/${i.target}/`)
    );
  } else {
    console.log('\n✓  No obvious cross-linking opportunities found');
  }

  // Auto-fix
  console.log('\n─── Auto-Fix ───────────────────────────────────────');
  const fixes = autoFixHubLinks(articles, hubSpokeIssues, categories);
  if (fixes.length) {
    console.log(`\n${DRY_RUN ? 'Would fix' : 'Fixed'} ${fixes.length} missing hub links:`);
    fixes.forEach(f => console.log(`   - ${f.article} → ${f.hub} (${f.action})`));
  } else {
    console.log('\n✓  No auto-fixes needed');
  }

  // Summary
  const totalIssues = hubSpokeIssues.length + orphanIssues.length;
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(` Summary: ${totalIssues} issues, ${crossLinkIssues.length} cross-link opportunities, ${fixes.length} auto-fixes`);
  console.log('═══════════════════════════════════════════════════════\n');

  // Write report to file
  const report = {
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN,
    stats: {
      totalArticles: articles.length,
      totalPages: siteMap.size,
      categories: Object.keys(categories).length,
    },
    hubSpokeIssues,
    orphanIssues,
    crossLinkOpportunities: crossLinkIssues.length,
    fixes,
  };

  const reportPath = join(ROOT, 'scripts', 'linking-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Full report saved to: ${reportPath}`);
}

main();
