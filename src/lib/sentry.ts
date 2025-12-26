import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Only initialize if DSN is provided and explicitly enabled
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const sentryEnabled = import.meta.env.VITE_ENABLE_SENTRY === 'true';
  
  if (!sentryDsn || !sentryEnabled) {
    return;
  }

  try {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      environment: import.meta.env.MODE,
      
      // Filter out sensitive data
      beforeSend(event) {
        // Remove sensitive user data if needed
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
  } catch {
    // Silent failure - Sentry init is optional
  }
};

// Custom error boundary
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Manual error capture
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Set user context (after login)
export const setSentryUser = (userId: string, role?: string) => {
  Sentry.setUser({ id: userId, role });
};

// Clear user context (after logout)
export const clearSentryUser = () => {
  Sentry.setUser(null);
};
