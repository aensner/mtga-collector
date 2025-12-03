/**
 * Centralized logging service with configurable levels.
 * In production, console output is minimized and could be sent to a logging service.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = import.meta.env.DEV;

// Log level hierarchy (lower number = more verbose)
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level (in production, only show warnings and errors)
const MIN_LEVEL: LogLevel = isDev ? 'debug' : 'warn';

/**
 * Format a log message with optional context
 */
function formatMessage(context: string | undefined, message: string): string {
  return context ? `[${context}] ${message}` : message;
}

/**
 * Check if a log level should be displayed
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

/**
 * Main logger object with methods for each log level
 */
export const logger = {
  /**
   * Debug logs - only shown in development
   * Use for detailed debugging information
   */
  debug(message: string, data?: unknown, context?: string): void {
    if (!shouldLog('debug')) return;
    console.log(formatMessage(context, message), data !== undefined ? data : '');
  },

  /**
   * Info logs - general information
   * Use for tracking normal application flow
   */
  info(message: string, data?: unknown, context?: string): void {
    if (!shouldLog('info')) return;
    console.log(formatMessage(context, message), data !== undefined ? data : '');
  },

  /**
   * Warning logs - potential issues
   * Use for recoverable problems or deprecated usage
   */
  warn(message: string, data?: unknown, context?: string): void {
    if (!shouldLog('warn')) return;
    console.warn(formatMessage(context, message), data !== undefined ? data : '');
  },

  /**
   * Error logs - always shown
   * Use for errors that affect functionality
   */
  error(message: string, error?: unknown, context?: string): void {
    if (!shouldLog('error')) return;
    console.error(formatMessage(context, message), error !== undefined ? error : '');

    // In production, could send to error tracking service
    // e.g., Sentry, LogRocket, etc.
  },

  /**
   * Create a scoped logger with a fixed context
   * Useful for services or components that want consistent logging
   */
  scope(context: string) {
    return {
      debug: (message: string, data?: unknown) => logger.debug(message, data, context),
      info: (message: string, data?: unknown) => logger.info(message, data, context),
      warn: (message: string, data?: unknown) => logger.warn(message, data, context),
      error: (message: string, error?: unknown) => logger.error(message, error, context),
    };
  },

  /**
   * Performance timing helper
   * Returns a function to call when the operation is complete
   */
  time(label: string, context?: string): () => void {
    if (!isDev) return () => {};

    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      logger.debug(`${label} completed in ${duration.toFixed(2)}ms`, undefined, context);
    };
  },

  /**
   * Group related logs together (development only)
   */
  group(label: string, fn: () => void, context?: string): void {
    if (!isDev) {
      fn();
      return;
    }

    console.group(formatMessage(context, label));
    try {
      fn();
    } finally {
      console.groupEnd();
    }
  },
};

// Export scoped loggers for common contexts
export const ocrLogger = logger.scope('OCR');
export const aiLogger = logger.scope('AI');
export const dbLogger = logger.scope('Database');
export const processingLogger = logger.scope('Processing');
export const scryfallLogger = logger.scope('Scryfall');

export default logger;
