import * as Sentry from "@sentry/react";

/**
 * GHD Spor — hata izleme isteğe bağlıdır.
 *
 * Upstream projede gömülü bir Sentry DSN'i vardı ve `sendDefaultPii: true` ile
 * üye e-postaları/sağlık verileri üçüncü taraf projeye gidebiliyordu. GHD
 * kurulumunda hiçbir dış analitik/hata servisi varsayılan olarak AÇIK DEĞİLDİR.
 * İstenirse deploy sırasında `VITE_SENTRY_DSN` verilerek kendi Sentry
 * projenize bağlanabilir; PII gönderimi yine kapalıdır.
 */
const dsn = import.meta.env.VITE_SENTRY_DSN || "";
export const sentryEnabled = Boolean(dsn);

if (sentryEnabled) {
  Sentry.init({
    dsn,
    enabled: true,
    environment: import.meta.env.MODE,
    release: __SENTRY_RELEASE__,
    sendDefaultPii: false,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    ignoreErrors: ["Failed to connect to MetaMask"],
    denyUrls: [/^chrome-extension:\/\//, /^moz-extension:\/\//, /^safari-web-extension:\/\//],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 0.5,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    enableLogs: false,
  });
}
