import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const body = `User-agent: *
Allow: /

Sitemap: https://cursedtours.com/sitemap.xml

# Block WordPress legacy paths
Disallow: /wp-admin/
Disallow: /wp-content/
Disallow: /wp-includes/
Disallow: /wp-json/
Disallow: /xmlrpc.php
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
