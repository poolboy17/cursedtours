import type { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const hasWpParam = url.searchParams.has("p") ||
                     url.searchParams.has("page_id") ||
                     url.searchParams.has("cb");

  if (hasWpParam) {
    return new Response(null, {
      status: 301,
      headers: { "Location": "https://cursedtours.com/" }
    });
  }

  return context.next();
};

export const config = { path: "/" };
