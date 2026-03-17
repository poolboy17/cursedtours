import netlify from '@astrojs/netlify';
import tailwind from '@astrojs/tailwind';
import sentry from '@sentry/astro';
import { defineConfig } from 'astro/config';

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

export default defineConfig({
  output: 'static',
  adapter: netlify(),
  site: 'https://cursedtours.com',
  integrations: [
    tailwind(),
    sentry({
      telemetry: false,
      ...(sentryAuthToken
        ? {
            org: 'none-4o0',
            project: 'cursedtours',
            authToken: sentryAuthToken,
            sourceMapsUploadOptions: {
              project: 'cursedtours',
              authToken: sentryAuthToken,
            },
          }
        : {}),
    }),
  ],
});
