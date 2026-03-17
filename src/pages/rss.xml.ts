import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

interface RssArticleModule {
  title: string;
  date: string;
  excerpt: string;
  uri: string;
  status?: string;
}

export async function GET(context: APIContext) {
  const articles = Object.values(
    import.meta.glob('../data/articles/*.json', { eager: true }) as Record<string, RssArticleModule>
  )
    .filter((a) => a.status === 'publish')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  return rss({
    title: 'Cursed Tours — Ghost Tours & Haunted Experiences',
    description: 'Ghost tours, haunted places, and dark travel guides from around the world.',
    site: context.site!,
    items: articles.map((a) => ({
      title: a.title,
      pubDate: new Date(a.date),
      description: a.excerpt,
      link: a.uri,
    })),
  });
}
