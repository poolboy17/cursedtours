import type { APIRoute } from 'astro';
import { getAllArticles, CATEGORIES } from '../data/articles';
import { DESTINATIONS } from '../data/destinations';
import { getAllBlogHubSlugs } from '../data/blogHubs';

export const GET: APIRoute = async () => {
  const site = 'https://cursedtours.com';
  const now = new Date().toISOString().split('T')[0];

  // Derive city hubs dynamically from CATEGORIES — no manual updates needed
  const cityHubs = [...new Set(
    Object.values(CATEGORIES)
      .filter(c => c.type === 'city' && c.city)
      .map(c => c.city!)
  )].sort();

  const experiences = [
    'cemetery-tours', 'paranormal-investigations', 'pub-crawls',
    'true-crime', 'walking-tours',
  ];

  const destinations = Object.keys(DESTINATIONS);
  const blogHubs = getAllBlogHubSlugs();
  const utilities = ['about', 'contact', 'editorial-policy', 'privacy-policy', 'terms'];
  const articles = getAllArticles();

  function entry(path: string, priority: string, changefreq: string) {
    return `  <url>
    <loc>${site}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  const urls = [
    entry('/', '1.0', 'weekly'),
    entry('/articles/', '0.8', 'weekly'),
    entry('/destinations/', '0.8', 'monthly'),
    // All Tier 1 pillar pages get equal priority
    ...cityHubs.map(c => entry(`/${c}-ghost-tours/`, '0.9', 'monthly')),
    ...destinations.map(d => entry(`/destinations/${d}/`, '0.9', 'monthly')),
    entry('/blog/', '0.7', 'weekly'),
    ...blogHubs.map(b => entry(`/blog/${b}/`, '0.9', 'monthly')),
    entry('/experiences/', '0.6', 'monthly'),
    ...experiences.map(e => entry(`/experiences/${e}/`, '0.6', 'monthly')),
    ...articles.map(a => entry(`/articles/${a.slug}/`, '0.7', 'weekly')),
    ...utilities.map(u => entry(`/${u}/`, '0.3', 'yearly')),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
