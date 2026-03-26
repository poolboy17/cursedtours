import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  articles.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: 'Cursed Tours — Ghost Tours & Haunted Experiences',
    description: 'Ghost tours, haunted places, and dark travel guides from around the world.',
    site: context.site!,
    items: articles.slice(0, 50).map((entry) => ({
      title: entry.data.title,
      pubDate: new Date(entry.data.date),
      description: entry.data.excerpt,
      link: `/articles/${entry.slug}/`,
    })),
  });
}
