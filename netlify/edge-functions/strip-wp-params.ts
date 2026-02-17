import type { Context } from "https://edge.netlify.com";

// Old WordPress URL redirects
const defined301s: Record<string, string> = {
  "/contact-us/": "/contact/",
  "/terms-of-service/": "/terms/",
};

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);

  // 301 WordPress query-string params on homepage
  if (url.pathname === "/" || url.pathname === "") {
    const hasWpParam = url.searchParams.has("p") ||
                       url.searchParams.has("page_id") ||
                       url.searchParams.has("cb");
    if (hasWpParam) {
      return new Response(null, {
        status: 301,
        headers: { "Location": "https://cursedtours.com/" }
      });
    }
  }

  // 301 old WordPress paths to new Astro equivalents
  const redirect = defined301s[url.pathname];
  if (redirect) {
    return new Response(null, {
      status: 301,
      headers: { "Location": `https://cursedtours.com${redirect}` }
    });
  }

  return context.next();
};

export const config = { path: ["/*"] };
