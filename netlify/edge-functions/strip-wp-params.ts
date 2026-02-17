export default async (request: Request) => {
  const url = new URL(request.url);

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

  return;
};

export const config = { path: "/" };
