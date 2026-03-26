import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    category: z.string(),
    categorySlug: z.string(),
    coverImage: z.string(),
    coverAlt: z.string(),
    author: z.string(),
    hub: z.string(),
    relatedArticles: z.array(z.string()).optional().default([]),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { articles };
