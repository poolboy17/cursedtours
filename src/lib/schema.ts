// src/lib/schema.ts — Centralized JSON-LD structured data builder
// Adapted from LensLifestyle gold standard for Cursed Tours
// Usage: import { buildSchemas } from "../lib/schema";
//        const schemas = buildSchemas("article", { headline, description, ... }, breadcrumbs);

const DOMAIN = "https://cursedtours.com";
const SITE_NAME = "Cursed Tours";
const LOGO_URL = `${DOMAIN}/images/logo.png`;

interface BreadcrumbItem { name: string; url?: string; }

interface SchemaInput {
    url?: string;
    // Article / general
    headline?: string;
    title?: string;
    description?: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    articleSection?: string;
    // TouristAttraction / hub
    cityName?: string;
    country?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    // Product (tour)
    productName?: string;
    price?: number;
    currency?: string;
    ratingValue?: number;
    reviewCount?: number;
    bookingUrl?: string;
    // FAQ
    questions?: Array<{ question: string; answer: string }>;
    // CollectionPage
    itemCount?: number;
}

type SchemaType = "website" | "article" | "touristAttraction" | "product" | "collectionPage" | "aboutPage" | "faqPage";

const org = {
    "@type": "Organization" as const,
    name: SITE_NAME,
    url: DOMAIN,
    logo: { "@type": "ImageObject" as const, url: LOGO_URL },
};

export function buildSchemas(
    type: SchemaType,
    data: SchemaInput = {},
    breadcrumbs?: BreadcrumbItem[]
): object[] {
    const schemas: object[] = [];
    const canonicalUrl = data.url || DOMAIN;
    const today = new Date().toISOString().split("T")[0];

    // WebSite (homepage)
    if (type === "website") {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: DOMAIN,
            publisher: org,
            potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${DOMAIN}/destinations?q={search_term_string}` },
                "query-input": "required name=search_term_string",
            },
        });
    }

    // Article
    if (type === "article") {
        const a: any = {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: (data.headline || data.title || "").slice(0, 110),
            description: (data.description || "").slice(0, 160),
            author: [
                { "@type": "Person", name: "Cursed Tours Editorial Team", url: `${DOMAIN}/about/` },
                { "@type": "Organization", name: SITE_NAME, url: DOMAIN },
            ],
            publisher: { ...org },
            datePublished: data.datePublished || today,
            dateModified: data.dateModified || today,
            mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
        };
        if (data.image) a.image = data.image;
        if (data.articleSection) a.articleSection = data.articleSection;
        schemas.push(a);
    }

    // TouristAttraction (city hub pages)
    if (type === "touristAttraction") {
        const d: any = {
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            name: data.cityName ? `${data.cityName} Ghost Tours` : (data.title || ""),
            description: (data.description || "").slice(0, 160),
            touristType: ["Ghost Tours", "Haunted History", "Walking Tours"],
            url: canonicalUrl,
        };
        if (data.image) d.image = data.image.startsWith("http") ? data.image : `${DOMAIN}${data.image}`;
        if (data.cityName) {
            d.address = {
                "@type": "PostalAddress",
                addressLocality: data.cityName,
                ...(data.region && { addressRegion: data.region }),
                ...(data.country && { addressCountry: data.country }),
            };
        }
        if (data.latitude && data.longitude) {
            d.geo = { "@type": "GeoCoordinates", latitude: data.latitude, longitude: data.longitude };
        }
        schemas.push(d);
    }

    // Product (tour)
    if (type === "product") {
        const p: any = {
            "@context": "https://schema.org",
            "@type": "Product",
            name: data.productName || data.title || "",
            description: (data.description || "").slice(0, 160),
            url: canonicalUrl,
        };
        if (data.image) p.image = data.image;
        if (data.price) {
            p.offers = {
                "@type": "Offer",
                price: data.price,
                priceCurrency: data.currency || "USD",
                availability: "https://schema.org/InStock",
                url: data.bookingUrl || canonicalUrl,
            };
        }
        if (data.ratingValue && data.reviewCount) {
            p.aggregateRating = {
                "@type": "AggregateRating",
                ratingValue: data.ratingValue,
                reviewCount: data.reviewCount,
                bestRating: 5,
            };
        }
        schemas.push(p);
    }

    // CollectionPage
    if (type === "collectionPage") {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: data.title || "",
            description: (data.description || "").slice(0, 160),
            url: canonicalUrl,
            mainEntity: { "@type": "ItemList", numberOfItems: data.itemCount || 0 },
        });
    }

    // AboutPage
    if (type === "aboutPage") {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: data.title || "About " + SITE_NAME,
            description: (data.description || "").slice(0, 160),
            url: canonicalUrl,
            mainEntity: org,
        });
    }

    // FAQPage (standalone or piggyback on pages with questions)
    if (data.questions && data.questions.length >= 2) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: data.questions.map(q => ({
                "@type": "Question",
                name: q.question,
                acceptedAnswer: { "@type": "Answer", text: q.answer },
            })),
        });
    }

    // BreadcrumbList (every non-homepage page)
    if (breadcrumbs && breadcrumbs.length > 0) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs.map((item, i) => {
                const entry: any = { "@type": "ListItem", position: i + 1, name: item.name };
                if (i < breadcrumbs.length - 1 && item.url) {
                    entry.item = item.url.startsWith("http") ? item.url : DOMAIN + item.url;
                }
                return entry;
            }),
        });
    }

    return schemas;
}
