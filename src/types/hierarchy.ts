/**
 * Page Hierarchy Type Definitions
 *
 * Every page declares its identity: what it is, where it sits, who its parent is.
 * This drives breadcrumbs, structured data, and build-time validation.
 */

/** Page types in the site architecture */
export type PageType =
  | 'homepage'        // Level 0 — the root, one per site
  | 'parent'          // Level 1 — city hubs, destinations, topical hubs, experiences
  | 'child'           // Level 2 — articles (guides and standard)
  | 'index'           // Navigation — directory pages (/articles/, /destinations/, /experiences/)
  | 'utility';        // Non-SEO — about, contact, privacy, terms

/** Sub-classification for parent pages */
export type ParentVariant =
  | 'city'            // /{city}-ghost-tours/
  | 'destination'     // /destinations/{slug}/
  | 'topical'         // /articles/category/{slug}/ (dracula, tour-planning)
  | 'experience';     // /experiences/{slug}/

/** Sub-classification for child pages */
export type ChildVariant =
  | 'guide'           // Comprehensive overview (~1,200+ words)
  | 'article';        // Supporting article (~800-1,200 words)

/** Identity declaration for every page */
export interface PageIdentity {
  /** What this page is */
  pageType: PageType;

  /** Hierarchy depth: 0 = homepage, 1 = parent, 2 = child */
  level: 0 | 1 | 2;

  /** Canonical URL of the parent page. 'none' for homepage only. */
  parent: string;

  /** This page's URL slug */
  slug: string;

  /** This page's full canonical URL */
  canonical: string;

  /** Sub-classification for parent or child pages */
  variant?: ParentVariant | ChildVariant;

  /** City key, if this page belongs to a city cluster */
  city?: string;

  /** Category slug, if this page belongs to an article category */
  category?: string;
}

/** Category type flag — determines whether a category generates its own page */
export type CategoryType = 'city' | 'topical';

/** Extended category info with type flag */
export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  type: CategoryType;
  hubPage?: string;
  city?: string;
}

/**
 * Validation rules (enforced at build time):
 *
 * 1. Every page MUST declare a pageType
 * 2. Every page MUST declare a parent (except homepage)
 * 3. Parent URL MUST resolve to an existing page
 * 4. Parent level MUST be < child level
 * 5. City children MUST parent to /{city}-ghost-tours/ (not a category page)
 * 6. No two parent pages may own the same city
 * 7. Guide variant requires articleType === 'guide' in article data
 * 8. Every city parent MUST have parent = homepage
 * 9. Homepage parent MUST be 'none'
 * 10. Breadcrumb chain must match: homepage → parent → self
 */
