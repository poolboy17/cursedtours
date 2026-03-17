/**
 * Configurable checks — driven by site-specific config.
 */

import { countMatches, extractAnchors, extractIds, extractSectionIds } from '../lib/helpers.mjs';

export function testAnchorLinks(html, page, r, config) {
  const pillClasses = config.pillClasses || ['rounded-full'];
  const pillTargets = extractAnchors(html, pillClasses);
  const allIds = new Set(extractIds(html));

  let orphans = 0;
  for (const target of pillTargets) {
    if (!allIds.has(target)) {
      r.fail(page, 'anchor-link', `Orphan nav pill: #${target} — no matching element`);
      orphans++;
    }
  }
  if (orphans === 0 && pillTargets.length > 0) {
    r.pass(page, 'anchor-links', `${pillTargets.length} nav pills all valid`);
  } else if (pillTargets.length === 0) {
    r.fail(page, 'anchor-links', 'No nav pills found');
  }
}

export function testRequiredElements(html, page, r, patterns) {
  for (const item of patterns) {
    const found =
      item.pattern instanceof RegExp ? html.match(item.pattern) : html.includes(item.pattern);
    if (found) {
      r.pass(
        page,
        item.name,
        typeof found === 'object' && found[0] ? found[0].substring(0, 60) : 'Present'
      );
    } else if (item.warnOnly) {
      r.warn(page, item.name, `Missing: ${item.name}`);
    } else {
      r.fail(page, item.name, `Missing: ${item.name}`);
    }
  }
}

export function testCalloutNesting(html, page, r, calloutPattern) {
  const positions = [];
  let idx = -1;
  while ((idx = html.indexOf(calloutPattern, idx + 1)) !== -1) {
    positions.push(idx);
  }
  let nested = false;
  for (let i = 1; i < positions.length; i++) {
    const between = html.substring(positions[i - 1], positions[i]);
    const opens = countMatches(between, /<div[\s>]/g);
    const closes = countMatches(between, /<\/div>/g);
    if (opens > closes) {
      nested = true;
      break;
    }
  }
  if (nested) {
    r.fail(page, 'callout-nesting', 'Callout appears nested inside another callout');
  } else {
    r.pass(page, 'callout-nesting', 'No nesting issues');
  }
}

export function testScrollCadence(html, page, r, config) {
  const sectionIds = extractSectionIds(html);
  const structural = new Set(
    config.structuralIds || ['faq', 'explore-more', 'articles', 'explore']
  );
  const tourIds = sectionIds.filter((id) => !structural.has(id));
  const tourCount = tourIds.length;
  r.pass(page, 'tour-sections', `${tourCount} tours: ${tourIds.join(', ')}`);

  if (config.callouts) {
    const count = countMatches(html, config.callouts);
    const min =
      typeof config.minCallouts === 'function' ? config.minCallouts(page) : config.minCallouts || 2;
    if (count >= min) {
      r.pass(page, 'stat-callouts', `${count} callouts`);
    } else {
      r.warn(page, 'stat-callouts', `Only ${count} callout(s) — plan minimum is ${min}`);
    }
  }

  if (config.quotes) {
    const quotes = countMatches(html, config.quotes);
    const expected = config.expectedQuotes
      ? typeof config.expectedQuotes === 'function'
        ? config.expectedQuotes(page)
        : config.expectedQuotes
      : 1;
    if (quotes === expected) {
      r.pass(page, 'pull-quotes', `${quotes} pull quote(s)`);
    } else if (quotes > 0) {
      r.warn(page, 'pull-quotes', `${quotes} quotes (expected ${expected})`);
    } else {
      r.fail(page, 'pull-quotes', `0 pull quotes (expected ${expected})`);
    }
  }

  if (config.dividers) {
    const dividers = countMatches(html, config.dividers);
    const min = Math.max(tourCount - 1, 0);
    if (dividers >= min) {
      r.pass(page, 'dividers', `${dividers} dividers (min ${min} for ${tourCount} tours)`);
    } else {
      r.fail(page, 'dividers', `${dividers} dividers (need at least ${min})`);
    }
  }

  if (config.globs) {
    const blobs = countMatches(html, config.globs);
    if (blobs === tourCount) {
      r.pass(page, 'glow-blobs', `${blobs} blobs = ${tourCount} tours`);
    } else {
      r.warn(page, 'glow-blobs', `${blobs} blobs vs ${tourCount} tours`);
    }
  }

  if (config.shadedBlocks) {
    const blocks = countMatches(html, config.shadedBlocks);
    if (blocks === tourCount) {
      r.pass(page, 'shaded-blocks', `${blocks} shaded blocks`);
    } else {
      r.warn(page, 'shaded-blocks', `${blocks} blocks vs ${tourCount} tours`);
    }
  }
}

export function testVisualStyling(html, page, r, config) {
  if (config.glowShadow) {
    const withGlow = countMatches(html, config.glowShadow);
    const calloutTotal = config.calloutPattern
      ? countMatches(html, config.calloutPattern)
      : withGlow;
    if (calloutTotal > 0 && withGlow === calloutTotal) {
      r.pass(page, 'callout-glow', `${withGlow}/${calloutTotal} have glow`);
    } else if (calloutTotal > 0) {
      r.fail(page, 'callout-glow', `${withGlow}/${calloutTotal} have glow`);
    }
  }

  if (config.quoteBg && config.quotePattern) {
    const withBg = countMatches(html, config.quoteBg);
    const quoteTotal = countMatches(html, config.quotePattern);
    if (quoteTotal > 0 && withBg === quoteTotal) {
      r.pass(page, 'quote-bg', `${withBg}/${quoteTotal} have background`);
    } else if (quoteTotal > 0) {
      r.fail(page, 'quote-bg', `${withBg}/${quoteTotal} have background`);
    }
  }

  if (config.overflowSections) {
    const overflow = countMatches(html, config.overflowSections.pattern);
    const min = config.overflowSections.min || 3;
    if (overflow >= min) {
      r.pass(page, 'overflow-hidden', `${overflow} sections`);
    } else {
      r.warn(page, 'overflow-hidden', `Only ${overflow} sections have overflow-hidden`);
    }
  }
}

export function testContentGaps(html, page, r, config) {
  if (config.heroTagline) {
    const heroEnd = html.indexOf('<section id="');
    const heroChunk = heroEnd > 0 ? html.substring(0, heroEnd) : html.substring(0, 2000);
    if (heroChunk.includes('italic') && heroChunk.match(/<p[^>]*class="[^"]*italic/)) {
      const tagMatch = heroChunk.match(/<p[^>]*class="[^"]*italic[^"]*"[^>]*>([^<]+)/);
      r.pass(page, 'hero-tagline', tagMatch ? tagMatch[1].substring(0, 50) : 'Present');
    } else {
      r.warn(page, 'hero-tagline', 'No hero tagline');
    }
  }

  if (config.fullTemplatePages && config.articleGrid) {
    const ftSet =
      config.fullTemplatePages instanceof Set
        ? config.fullTemplatePages
        : new Set(config.fullTemplatePages);
    if (ftSet.has(page)) {
      if (html.includes('Articles') && html.match(/Explore[\s\S]{0,30}Articles/)) {
        r.pass(page, 'article-grid', 'Present (full template)');
      } else {
        r.fail(page, 'article-grid', 'Full template page missing article grid');
      }
    }
  }
}

export function testPaddingVariation(html, page, r, config) {
  const bumped = countMatches(html, config.bumped);
  const standard = countMatches(html, config.standard);
  const minB = config.minBumped || 2;
  const minS = config.minStandard || 4;
  if (bumped >= minB && standard >= minS) {
    r.pass(page, 'padding-variation', `${bumped} bumped + ${standard} standard`);
  } else if (bumped === 0) {
    r.fail(page, 'padding-variation', 'All sections have identical padding');
  } else {
    r.warn(page, 'padding-variation', `bumped=${bumped} standard=${standard}`);
  }
}
