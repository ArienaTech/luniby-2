// Sentry initialization and configuration
import * as Sentry from "@sentry/react";

// Initialize Sentry with environment-specific configuration for v10+
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  
  // Set tracesSampleRate based on environment
  // Production: 10% of transactions
  // Development: 100% of transactions
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Set environment
  environment: process.env.NODE_ENV || 'development',
  
  // Before send hook to filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_SENTRY_DEBUG) {
      return null;
    }
    
    // Filter out sensitive information from URLs
    if (event.request && event.request.url) {
      event.request.url = event.request.url.replace(/([?&])(token|key|password|secret)=[^&]*/gi, '$1$2=REDACTED');
    }
    
    return event;
  },
  
  // Ignore common non-critical errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Network request failed',
    'Failed to fetch',
  ],
});

// Set user context helper
export const setSentryUser = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username || user.email,
    });
  } else {
    Sentry.setUser(null);
  }
};

// Custom error logging helper
export const logError = (error, context = {}) => {
  console.error('Error:', error, context);
  Sentry.captureException(error, {
    extra: context,
  });
};

// Performance monitoring helper - compatible with Sentry v10+
export const startTransaction = (name, op = 'navigation') => {
  // In Sentry v10+, use startSpan or just return a no-op
  // Manual transaction tracking is often not needed with auto-instrumentation
  return {
    finish: () => {},
    setStatus: () => {},
    setTag: () => {},
    setData: () => {}
  };
};

export default Sentry;
