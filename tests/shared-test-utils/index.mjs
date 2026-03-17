/**
 * shared-test-utils — Cross-site Astro audit tooling.
 * Zero external dependencies.
 */

export { testAnchorLinks, testCalloutNesting, testContentGaps, testPaddingVariation, testRequiredElements, testScrollCadence, testVisualStyling } from './checks/configurable.mjs';
export { testDuplicateIds, testHeadingHierarchy, testHeadTags, testHtmlBalance } from './checks/generic.mjs';
export { discoverPages } from './lib/discovery.mjs';
export { allMatches, countMatches, extractAnchors, extractIds, extractSectionIds, findHeadings, getHeadContent } from './lib/helpers.mjs';
export { createResults, getExitCode, printReport } from './lib/results.mjs';

import { testAnchorLinks, testCalloutNesting, testContentGaps, testPaddingVariation, testRequiredElements, testScrollCadence, testVisualStyling } from './checks/configurable.mjs';
import { testDuplicateIds, testHeadingHierarchy, testHeadTags, testHtmlBalance } from './checks/generic.mjs';

export function createRunner(config) {
  const checks = config.checks || {};

  return function auditPage(html, page, r) {
    if (checks.htmlBalance !== false) {
      testHtmlBalance(html, page, r);
    }
    if (checks.duplicateIds !== false) {
      testDuplicateIds(html, page, r);
    }
    if (checks.headingHierarchy !== false) {
      testHeadingHierarchy(html, page, r);
    }
    if (checks.headTags) {
      testHeadTags(html, page, r, checks.headTags);
    }

    if (checks.anchorLinks) {
      testAnchorLinks(html, page, r, checks.anchorLinks);
    }
    if (checks.requiredElements) {
      testRequiredElements(html, page, r, checks.requiredElements);
    }
    if (checks.calloutNesting) {
      testCalloutNesting(html, page, r, checks.calloutNesting);
    }
    if (checks.scrollCadence) {
      testScrollCadence(html, page, r, checks.scrollCadence);
    }
    if (checks.visualStyling) {
      testVisualStyling(html, page, r, checks.visualStyling);
    }
    if (checks.contentGaps) {
      testContentGaps(html, page, r, checks.contentGaps);
    }
    if (checks.paddingVariation) {
      testPaddingVariation(html, page, r, checks.paddingVariation);
    }
  };
}
