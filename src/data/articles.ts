import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export interface Article {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  modified?: string;
  featuredImage: {
    sourceUrl: string;
    altText: string;
    width?: number;
    height?: number;
  };
  categories: {
    id: number;
    slug: string;
    name: string;
    description?: string;
  }[];
  wordCount?: number;
  readingTime?: number;
  keywords?: string[];
}

export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  /** Category type: 'city' links to a city hub, 'blog' links to a blog hub */
  type: 'city' | 'blog';
  /** URL of the parent page (city hub or destination page) */
  hubPage?: string;
  /** City key for city-type categories */
  city?: string;
  count?: number;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  'salem-witch-trials': {
    slug: 'salem-witch-trials',
    name: 'Salem Witch Trials',
    description: 'In-depth articles exploring the history, causes, trials, and lasting legacy of the Salem Witch Trials of 1692.',
    type: 'city',
    city: 'salem',
    hubPage: '/salem-ghost-tours/',
  },
  'new-orleans-voodoo-haunted-history': {
    slug: 'new-orleans-voodoo-haunted-history',
    name: 'New Orleans Voodoo & Haunted History',
    description: 'The true stories behind New Orleans\' haunted reputation—from Voodoo queens and pirate ghosts to the city\'s most documented hauntings.',
    type: 'city',
    city: 'new-orleans',
    hubPage: '/new-orleans-ghost-tours/',
  },
  'chicago-haunted-history': {
    slug: 'chicago-haunted-history',
    name: 'Chicago Haunted History',
    description: 'The dark history behind Chicago\'s hauntings—from the Great Fire and H.H. Holmes to Resurrection Mary, gangster ghosts, and the city\'s most haunted landmarks.',
    type: 'city',
    city: 'chicago',
    hubPage: '/chicago-ghost-tours/',
  },
  'savannah-haunted-history': {
    slug: 'savannah-haunted-history',
    name: 'Savannah Haunted History',
    description: 'The haunted history of Savannah—from Bonaventure Cemetery and colonial-era ghosts to the most documented hauntings in America\'s most haunted city.',
    type: 'city',
    city: 'savannah',
    hubPage: '/savannah-ghost-tours/',
  },
  'charleston-haunted-history': {
    slug: 'charleston-haunted-history',
    name: 'Charleston Haunted History',
    description: 'Charleston\'s dark past—from the Old City Jail and Civil War ghosts to Lowcountry hoodoo, pirate legends, and the Holy City\'s most haunted landmarks.',
    type: 'city',
    city: 'charleston',
    hubPage: '/charleston-ghost-tours/',
  },
  'boston-haunted-history': {
    slug: 'boston-haunted-history',
    name: 'Boston Haunted History',
    description: 'Boston\'s haunted colonial past—from the Boston Massacre and revolutionary ghosts to the Boston Strangler, Copp\'s Hill, and New England\'s darkest history.',
    type: 'city',
    city: 'boston',
    hubPage: '/boston-ghost-tours/',
  },
  'edinburgh-haunted-history': {
    slug: 'edinburgh-haunted-history',
    name: 'Edinburgh Haunted History',
    description: 'Edinburgh\'s haunted underground—from the Vaults and Mary King\'s Close to Burke & Hare, Greyfriars Kirkyard, and Scotland\'s darkest chapters.',
    type: 'city',
    city: 'edinburgh',
    hubPage: '/edinburgh-ghost-tours/',
  },
  'london-haunted-history': {
    slug: 'london-haunted-history',
    name: 'London Haunted History',
    description: 'London\'s haunted history—from Jack the Ripper and the Tower of London to plague pits, Highgate Cemetery, and 2,000 years of documented ghosts.',
    type: 'city',
    city: 'london',
    hubPage: '/london-ghost-tours/',
  },
  'new-york-haunted-history': {
    slug: 'new-york-haunted-history',
    name: 'New York Haunted History',
    description: 'New York City\'s haunted past—from the Five Points and Greenwich Village hauntings to Gilded Age murders, subway ghosts, and the Merchant\'s House Museum.',
    type: 'city',
    city: 'new-york',
    hubPage: '/new-york-ghost-tours/',
  },
  'st-augustine-haunted-history': {
    slug: 'st-augustine-haunted-history',
    name: 'St. Augustine Haunted History',
    description: 'America\'s oldest city and its ghosts—from Castillo de San Marcos and the St. Augustine Lighthouse to Spanish colonial hauntings and 450 years of dark history.',
    type: 'city',
    city: 'st-augustine',
    hubPage: '/st-augustine-ghost-tours/',
  },
  'san-antonio-haunted-history': {
    slug: 'san-antonio-haunted-history',
    name: 'San Antonio Haunted History',
    description: 'San Antonio\'s haunted past—from the ghosts of the Alamo and Spanish missions to the Menger Hotel, Railroad Tracks legend, and Tejano folklore.',
    type: 'city',
    city: 'san-antonio',
    hubPage: '/san-antonio-ghost-tours/',
  },
  'rome-haunted-history': {
    slug: 'rome-haunted-history',
    name: 'Rome Haunted History',
    description: 'Rome\'s haunted history—from the Colosseum and catacombs to the Capuchin Crypt, Nero\'s ghost, and 2,700 years of documented hauntings in the Eternal City.',
    type: 'city',
    city: 'rome',
    hubPage: '/rome-ghost-tours/',
  },
  'paris-haunted-history': {
    slug: 'paris-haunted-history',
    name: 'Paris Haunted History',
    description: 'The dark side of Paris—from the Catacombs and Père Lachaise to French Revolution ghosts, the Phantom of the Opera, and the city\'s most haunted landmarks.',
    type: 'city',
    city: 'paris',
    hubPage: '/paris-ghost-tours/',
  },
  'dublin-haunted-history': {
    slug: 'dublin-haunted-history',
    name: 'Dublin Haunted History',
    description: 'Dublin\'s haunted history—from Kilmainham Gaol and the Hellfire Club to Viking Dublin, Bram Stoker\'s inspiration, and Ireland\'s most documented ghosts.',
    type: 'city',
    city: 'dublin',
    hubPage: '/dublin-ghost-tours/',
  },
  'washington-dc-haunted-history': {
    slug: 'washington-dc-haunted-history',
    name: 'Washington DC Haunted History',
    description: 'The haunted capital—from Lincoln\'s ghost in the White House and Capitol Hill hauntings to Georgetown\'s Exorcist steps and the Octagon House.',
    type: 'city',
    city: 'washington-dc',
    hubPage: '/washington-dc-ghost-tours/',
  },
  'nashville-haunted-history': {
    slug: 'nashville-haunted-history',
    name: 'Nashville Haunted History',
    description: 'Nashville\'s haunted side—from the Ryman Auditorium and Printers Alley to the Bell Witch, Two Rivers Mansion, and Tennessee\'s darkest legends.',
    type: 'city',
    city: 'nashville',
    hubPage: '/nashville-ghost-tours/',
  },
  'austin-haunted-history': {
    slug: 'austin-haunted-history',
    name: 'Austin Haunted History',
    description: 'Austin\'s dark history—from the Driskill Hotel and Servant Girl Annihilator to Moonlight Towers, Littlefield House, and Sixth Street hauntings.',
    type: 'city',
    city: 'austin',
    hubPage: '/austin-ghost-tours/',
  },
  'denver-haunted-history': {
    slug: 'denver-haunted-history',
    name: 'Denver Haunted History',
    description: 'Denver\'s haunted history—from Cheesman Park\'s disturbed graves and the Brown Palace to Molly Brown House, the Lumber Baron Inn, and frontier-era ghosts.',
    type: 'city',
    city: 'denver',
    hubPage: '/denver-ghost-tours/',
  },
  'key-west-haunted-history': {
    slug: 'key-west-haunted-history',
    name: 'Key West Haunted History',
    description: 'Key West\'s haunted history—from Robert the Doll and Fort East Martello to shipwreck legends, yellow fever epidemics, and the ghosts of Bone Island.',
    type: 'city',
    city: 'key-west',
    hubPage: '/key-west-ghost-tours/',
  },

  // ── Blog Hub Categories ───────────────────────────────────────────
  'vampire-culture': {
    slug: 'vampire-culture',
    name: 'Vampire Culture',
    description: 'Dracula, Bram Stoker, vampire folklore, and how pop culture from Twilight to Nosferatu keeps the legend alive.',
    type: 'blog',
    hubPage: '/blog/vampire-culture/',
  },
  'salem-witch-trials-history': {
    slug: 'salem-witch-trials-history',
    name: 'Salem Witch Trials History',
    description: 'The causes, people, courts, and lasting legacy of the 1692 Salem witch trials.',
    type: 'blog',
    hubPage: '/blog/salem-witch-trials/',
  },
  'tower-of-london-history': {
    slug: 'tower-of-london-history',
    name: 'Tower of London History',
    description: 'Executions, prisoners, the Crown Jewels, and nearly 1,000 years of royal terror.',
    type: 'blog',
    hubPage: '/blog/tower-of-london/',
  },
  'american-prison-history': {
    slug: 'american-prison-history',
    name: 'American Prison History',
    description: 'From Eastern State to Alcatraz to Port Arthur—solitary confinement, famous inmates, daring escapes, and the haunted remains.',
    type: 'blog',
    hubPage: '/blog/prison-history/',
  },
  'gettysburg-civil-war': {
    slug: 'gettysburg-civil-war',
    name: 'Gettysburg & the Civil War',
    description: 'The bloodiest battle of the Civil War—tactics, aftermath, ghosts, and why it still haunts.',
    type: 'blog',
    hubPage: '/blog/gettysburg/',
  },
};

let _cache: Article[] | null = null;

export function getAllArticles(): Article[] {
  if (_cache) return _cache;

  const dir = join(process.cwd(), 'src/data/articles');
  const files = readdirSync(dir).filter(f => f.endsWith('.json'));

  _cache = files.map(file => {
    const raw = readFileSync(join(dir, file), 'utf-8');
    const data = JSON.parse(raw);
    const img = typeof data.featuredImage === 'string'
      ? { sourceUrl: data.featuredImage, altText: data.title }
      : data.featuredImage;
    return {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || '',
      date: data.date,
      modified: data.modified,
      featuredImage: img,
      categories: data.categories.map((c: any) =>
        typeof c === 'string' ? { id: 0, slug: c, name: c } : c
      ),
      wordCount: data.wordCount,
      readingTime: data.readingTime,
      keywords: data.keywords,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return _cache;
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return getAllArticles().filter(a =>
    a.categories.some(c => c.slug === categorySlug)
  );
}

export function getArticle(slug: string): Article | undefined {
  return getAllArticles().find(a => a.slug === slug);
}

export function getRelatedArticles(article: Article, limit = 4): Article[] {
  const catSlugs = article.categories.map(c => c.slug);
  return getAllArticles()
    .filter(a => a.slug !== article.slug && a.categories.some(c => catSlugs.includes(c.slug)))
    .slice(0, limit);
}
