import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sentry from '@sentry/astro';

export default defineConfig({
  output: 'static',
  site: 'https://cursedtours.com',
  integrations: [
    tailwind(),
    sentry({
      dsn: 'https://b3e134275e613db9d8b3cc462f8c597e@o4508247438655488.ingest.us.sentry.io/4510983589068800',
      org: 'none-4o0',
      project: 'cursedtours',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourceMapsUploadOptions: {
        project: 'cursedtours',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
});
