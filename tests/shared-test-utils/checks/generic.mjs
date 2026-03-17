/**
 * Generic checks — work on any Astro site with zero config.
 */

import { allMatches, countMatches, extractIds, getHeadContent } from '../lib/helpers.mjs';

export function testDuplicateIds(html, page, r) {
  const ids = extractIds(html);
  const seen = {};
  ids.forEach((id) => {
    seen[id] = (seen[id] || 0) + 1;
  });
  const dupes = Object.entries(seen).filter(([, n]) => n > 1);
  if (dupes.length === 0) {
    r.pass(page, 'unique-ids', `${ids.length} IDs, all unique`);
  } else {
    r.fail(page, 'unique-ids', `Duplicates: ${dupes.map(([id, n]) => `${id}(${n})`).join(', ')}`);
  }
}

export function testHeadingHierarchy(html, page, r) {
  const headings = allMatches(html, /<(h[1-6])[^>]*>/g).map((m) => parseInt(m[1][1]));
  if (headings.length === 0) {
    r.fail(page, 'heading-hierarchy', 'No headings found');
    return;
  }
  if (headings[0] !== 1) {
    r.fail(page, 'heading-hierarchy', `First heading is h${headings[0]}, expected h1`);
    return;
  }
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      r.fail(page, 'heading-hierarchy', `Skip: h${headings[i - 1]} → h${headings[i]}`);
      return;
    }
  }
  r.pass(page, 'heading-hierarchy', `${headings.length} headings, no skips`);
}

export function testHeadTags(html, page, r, opts = {}) {
  const head = getHeadContent(html);

  if (opts.requireCanonical) {
    const canonical = head.match(/rel="canonical"\s+href="([^"]+)"/) || head.match(/href="([^"]+)"\s+rel="canonical"/);
    if (canonical) {
      r.pass(page, 'canonical', canonical[1]);
    } else {
      r.fail(page, 'canonical', 'Missing canonical URL');
    }
  }

  if (opts.requireOgImage) {
    if (head.match(/property="og:image"[^>]+content="https?:\/\//) || head.match(/content="https?:\/\/[^\"]+"\s+property="og:image"/)) {
      r.pass(page, 'og-image', 'og:image URL present');
    } else {
      r.warn(page, 'og-image', 'No og:image URL — social shares have no preview');
    }
  }

  if (opts.requireDescription) {
    if (head.match(/name="description"\s+content="[^"]+"|content="[^"]+"\s+name="description"/)) {
      r.pass(page, 'meta-description', 'Present');
    } else {
      r.fail(page, 'meta-description', 'Missing meta description');
    }
  }
}

export function testHtmlBalance(html, page, r) {
  const openDivs = countMatches(html, /<div[\s>]/g);
  const closeDivs = countMatches(html, /<\/div>/g);
  if (openDivs === closeDivs) {
    r.pass(page, 'div-balance', `${openDivs} divs balanced`);
  } else {
    r.fail(page, 'div-balance', `open=${openDivs} close=${closeDivs} diff=${openDivs - closeDivs}`);
  }

  const openSections = countMatches(html, /<section[\s>]/g);
  const closeSections = countMatches(html, /<\/section>/g);
  if (openSections === closeSections) {
    r.pass(page, 'section-balance', `${openSections} sections balanced`);
  } else {
    r.fail(page, 'section-balance', `open=${openSections} close=${closeSections}`);
  }
}
