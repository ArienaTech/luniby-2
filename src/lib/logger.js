// Logging utility with different log levels
class Logger {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  setLogLevel(level) {
    if (this.levels[level] !== undefined) {
      this.logLevel = level;
    }
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  debug(...args) {
    if (this.shouldLog('debug')) {
      console.log('🔍 [DEBUG]', ...args);
    }
  }

  info(...args) {
    if (this.shouldLog('info')) {
      console.log('ℹ️ [INFO]', ...args);
    }
  }

  warn(...args) {
    if (this.shouldLog('warn')) {
      console.warn('⚠️ [WARN]', ...args);
    }
  }

  error(...args) {
    if (this.shouldLog('error')) {
      console.error('❌ [ERROR]', ...args);
    }
  }

  // Log with custom prefix
  log(prefix, ...args) {
    console.log(prefix, ...args);
  }

  // Log performance metrics
  performance(label, duration) {
    this.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
  }

  // Log API calls
  api(method, url, status) {
    this.debug(`🌐 API ${method} ${url} - ${status}`);
  }

  // Log user actions
  action(action, details) {
    this.info(`👤 User action: ${action}`, details);
  }

  // Log component lifecycle
  lifecycle(component, event) {
    this.debug(`🔄 ${component} - ${event}`);
  }
}

// Create singleton instance
const logger = new Logger();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.logger = logger;
}

export default logger;
