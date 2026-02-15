/**
 * CursedTours audit config — all checks enabled.
 * Purple theme, 18 city hub pages, ghost tour architecture.
 */
export default {
  siteName: 'CursedTours',
  distDir: './dist',
  pagePattern: /^[a-z-]+-ghost-tours$/,

  fullTemplatePages: new Set([
    'charleston-ghost-tours', 'chicago-ghost-tours', 'edinburgh-ghost-tours',
    'london-ghost-tours', 'new-orleans-ghost-tours', 'salem-ghost-tours',
    'savannah-ghost-tours', 'st-augustine-ghost-tours'
  ]),

  checks: {
    // Generic
    htmlBalance: true,
    duplicateIds: true,
    headingHierarchy: true,
    headTags: {
      requireCanonical: true,
      requireOgImage: true,
      requireDescription: true,
    },

    // Anchor links
    anchorLinks: {
      pillClasses: ['rounded-full'],
    },

    // Required elements
    requiredElements: [
      { name: 'faq-schema', pattern: '"FAQPage"' },
      { name: 'hero-bg', pattern: 'background-image: url(' },
      { name: 'breadcrumbs', pattern: 'Home</a>' },
      { name: 'explore-more', pattern: 'Explore More Haunted Cities' },
      { name: 'why-haunted', pattern: /Why\s+[\w\s.'-]+\s+(?:Is|Are|Most\s+)?Haunted/i },
    ],

    // Callout nesting detection
    calloutNesting: 'bg-gradient-to-b from-purple-950',

    // Scroll cadence
    scrollCadence: {
      structuralIds: ['faq', 'explore-more', 'articles', 'explore'],
      callouts: 'bg-gradient-to-b from-purple-950',
      minCallouts: 2,
      quotes: 'border-l-4 border-purple-500/50',
      expectedQuotes: (page) => page === 'savannah-ghost-tours' ? 2 : 1,
      dividers: 'h-px bg-gradient-to-r from-transparent via-purple-500',
      globs: 'rounded-full blur-3xl',
      shadedBlocks: 'bg-[#0d0816]/60 rounded-xl',
    },

    // Visual styling
    visualStyling: {
      glowShadow: 'text-shadow: 0 0 30px rgba(168, 85, 247',
      calloutPattern: 'bg-gradient-to-b from-purple-950',
      quoteBg: 'bg-purple-950/[0.15] rounded-r-lg',
      quotePattern: 'border-l-4 border-purple-500/50',
      overflowSections: { pattern: 'relative overflow-hidden', min: 3 },
    },

    // Content gaps
    contentGaps: {
      heroTagline: true,
      articleGrid: true,
      fullTemplatePages: [
        'charleston-ghost-tours', 'chicago-ghost-tours', 'edinburgh-ghost-tours',
        'london-ghost-tours', 'new-orleans-ghost-tours', 'salem-ghost-tours',
        'savannah-ghost-tours', 'st-augustine-ghost-tours'
      ],
    },

    // Padding variation
    paddingVariation: {
      bumped: 'py-16 md:py-20',
      standard: 'py-12 md:py-16',
      minBumped: 2,
      minStandard: 4,
    },
  },
};
