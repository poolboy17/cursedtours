/** @type {import('internal-linking').LinkingConfig} */
export default {
  siteName: 'CursedTours',
  siteUrl: 'https://cursedtours.com',
  distDir: './dist',
  pageTypes: [
    { name: 'city-hub', pattern: /^\/[a-z]+-ghost-tours\/$/, role: 'hub', minLinksOut: 5, maxLinksOut: 15 },
    { name: 'article', pattern: /^\/articles\//, role: 'spoke', minLinksOut: 3, maxLinksOut: 8 },
    { name: 'destination', pattern: /^\/destinations\//, role: 'spoke', minLinksOut: 3, maxLinksOut: 8 },
    { name: 'experience', pattern: /^\/experiences\//, role: 'spoke', minLinksOut: 3, maxLinksOut: 8 },
    { name: 'blog', pattern: /^\/blog\//, role: 'bridge', minLinksOut: 3, maxLinksOut: 8 },
    { name: 'homepage', pattern: /^\/$/, role: 'static' },
    { name: 'static', pattern: /^\/(about|contact|editorial-policy|privacy|terms)\/$/, role: 'static' },
  ],
  excludePaths: [/^\/404\//, /^\/_astro\//, /^\/rss/, /^\/sitemap/],
  bodySelector: 'main',
  excludeSelectors: ['nav', 'header', 'footer', '.breadcrumb'],
  clusterStrategy: 'city-tag',
  dataDir: 'src/data/articles',
};
