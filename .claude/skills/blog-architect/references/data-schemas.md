# Data Schemas — Blog Architect

## Hub Labels (`src/data/articles.ts`)

Hub labels are internal metadata mapping each spoke to its parent hub. NOT pages — lookup keys.

```typescript
export interface HubInfo {
  slug: string;          // Internal key: 'austin-haunted-history'
  name: string;          // Display: 'Austin Haunted History'
  description: string;
  hubPage: string;       // URL path: '/austin-ghost-tours/'
  hubKey?: string;       // Affiliate product lookup: 'austin'
}

export const HUB_LABELS: Record<string, HubInfo> = {
  'austin-haunted-history': {
    slug: 'austin-haunted-history',
    name: 'Austin Haunted History',
    description: 'Ghost stories and dark history of Austin, Texas.',
    hubPage: '/austin-ghost-tours/',
    hubKey: 'austin',
  },
};

export function getArticlesForHub(hubSlug: string): Article[] {
  return getAllArticles().filter(a => a.categories[0]?.slug === hubSlug);
}
```

## Spoke Article Schema (`src/data/articles/*.json`)

Each spoke is a standalone JSON file. Filename = `{slug}.json`.
**CRITICAL:** All JSON files must be written as UTF-8 with explicit encoding.
See writer-guide.md "Character Encoding" section. Use `encoding='utf-8'` +
`ensure_ascii=False` on every read/write to prevent mojibake.

```json
{
  "title": "Article Title Here",
  "slug": "article-slug-here",
  "id": 45001,
  "status": "publish",
  "post_type": "post",
  "uri": "/articles/article-slug-here/",
  "date": "2026-02-19 12:00:00",
  "modified": "2026-02-19 12:00:00",
  "content": "<p>HTML content...</p>",
  "excerpt": "One-sentence meta description under 160 chars.",
  "categories": [{
    "id": 585,
    "slug": "hub-label-slug",
    "name": "Hub Label Name",
    "description": "Hub label description."
  }],
  "pageType": "unassigned",
  "featuredImage": {
    "sourceUrl": "/images/articles/article-slug-here.webp",
    "altText": "Article Title Here"
  },
  "wordCount": 1366,
  "readingTime": 5,
  "articleType": "standard",
  "semanticScores": {
    "entities": 12,
    "years": 5,
    "dataPoints": 8,
    "namedPeople": 6,
    "sourceRefs": 2,
    "h2Breadth": 15,
    "entityDensity": 8.8
  }
}
```

### Field Rules

- `slug` — URL-safe, lowercase, hyphens. Unique across all articles.
- `id` — Unique integer. Increment from highest existing.
- `uri` — Always `/articles/{slug}/` with trailing slash.
- `content` — Raw HTML. No markdown. No `<h1>` (template handles title).
- `excerpt` — Under 160 chars. Becomes meta description.
- `categories` — Exactly ONE object whose `slug` matches a key in `HUB_LABELS`.
- `wordCount` — Actual word count excluding HTML tags.
- `readingTime` — `Math.ceil(wordCount / 265)`.
- `articleType` — `"standard"` (1,000-2,000 words) or `"comprehensive"` (2,000-3,500 words).
- `semanticScores` — Computed by SemanticPipe. Tracks content richness: entities (named places/institutions), years cited, data points (dates/measurements/addresses), named people, source references, H2 topic breadth, and entity density per 1K words. These are INFO-tier signals — tracked, never enforced.

## Affiliate Product Data (`src/data/hubProducts.ts`)

```typescript
export interface FeaturedProduct {
  productCode: string;
  title: string;
  image: string;
  price: string;
  rating: number;
  reviews: number;
  duration?: string;
  tier: 'hero' | 'budget' | 'premium' | 'alternative';
  affiliateUrl: string;
}

export const HUB_PRODUCTS: Record<string, FeaturedProduct[]> = {
  'austin': [
    // 3 products per hub: hero (top pick), budget (best value), premium
  ],
};
```

## Blog Post Data (`src/data/blogPosts.ts`) — Optional

```typescript
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;          // HTML body
  date: string;
  modified: string;
  relatedHubs: string[];    // 2-4 hub keys this post links into
  tags?: string[];           // Topical tags for blog pillar filtering
  featuredImage?: string;
  wordCount: number;
  readingTime: number;
}
```

**Key difference from spokes:** `relatedHubs` is an array — blog posts bridge multiple hub clusters.

Blog post JSON files: `src/data/blog-posts/{slug}.json`

**Content types for the blog layer:**
- Cross-hub listicles ("10 Most Haunted Hotels in America")
- Niche explainers ("How Ghost Tours Actually Work")
- Comparison content ("Walking Tours vs Bus Tours")
- Seasonal/timely ("Best Ghost Tours for Halloween 2026")
- Buyer's guides ("What to Wear on a Ghost Tour")
- Industry/trend pieces ("The Rise of Dark Tourism")

## Destination Data (`src/data/destinations.ts`) — Travel Sites Only

```typescript
export interface DestinationData {
  slug: string;
  title: string;
  hubKey: string;
  description: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  schemaType: 'TouristAttraction' | 'LandmarksOrHistoricalBuildings' | 'Product';
  affiliateProducts?: FeaturedProduct[];
}
```
