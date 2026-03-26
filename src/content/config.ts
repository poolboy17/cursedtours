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
    hubSlug: z.string().optional(),
    hubUrl: z.string().optional(),
    relatedArticles: z.array(z.string()).optional().default([]),
    draft: z.boolean().optional().default(false),
  }),
});

const hubs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    hubSlug: z.string(),
    city: z.string(),
    tourKey: z.string(),
    metaDescription: z.string(),
    heroImage: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    region: z.string(),
    country: z.string().default('US'),
    priceRange: z.string(),
    touristType: z.string(),
    tourCount: z.number().default(0),
    articleCount: z.number().default(0),
    categories: z.array(z.object({
      id: z.string(),
      icon: z.string(),
      label: z.string(),
    })),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })),
    spokes: z.array(z.string()).optional().default([]),
  }),
});

export const collections = { articles, hubs };
