import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://b3e134275e613db9d8b3cc462f8c597e@o4508247438655488.ingest.us.sentry.io/4510983589068800",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
