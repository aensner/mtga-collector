/**
 * Custom error types for better error handling throughout the application.
 * Replaces generic 'any' types in catch blocks with specific error types.
 */

/** Base application error with additional context */
export class AppError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;
  readonly timestamp: string;

  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/** API-related errors (OpenAI, Anthropic, Scryfall) */
export class APIError extends AppError {
  readonly status?: number;
  readonly provider?: string;

  constructor(
    message: string,
    code: string,
    options?: {
      status?: number;
      provider?: string;
      context?: Record<string, unknown>;
    }
  ) {
    super(message, code, options?.context);
    this.name = 'APIError';
    this.status = options?.status;
    this.provider = options?.provider;
  }

  static fromUnknown(error: unknown, provider?: string): APIError {
    if (error instanceof APIError) return error;

    if (error instanceof Error) {
      return new APIError(error.message, 'API_ERROR', { provider });
    }

    return new APIError(
      typeof error === 'string' ? error : 'Unknown API error',
      'API_ERROR',
      { provider }
    );
  }
}

/** Authentication errors */
export class AuthError extends APIError {
  constructor(message: string, provider?: string) {
    super(message, 'AUTH_ERROR', { status: 401, provider });
    this.name = 'AuthError';
  }
}

/** Rate limit / quota errors */
export class QuotaError extends APIError {
  constructor(message: string, provider?: string) {
    super(message, 'QUOTA_ERROR', { status: 429, provider });
    this.name = 'QuotaError';
  }
}

/** OCR processing errors */
export class OCRError extends AppError {
  readonly cardPosition?: { x: number; y: number };

  constructor(
    message: string,
    code: string = 'OCR_ERROR',
    cardPosition?: { x: number; y: number }
  ) {
    super(message, code, cardPosition ? { cardPosition } : undefined);
    this.name = 'OCRError';
    this.cardPosition = cardPosition;
  }
}

/** Database operation errors */
export class DatabaseError extends AppError {
  readonly operation?: string;

  constructor(message: string, operation?: string) {
    super(message, 'DATABASE_ERROR', operation ? { operation } : undefined);
    this.name = 'DatabaseError';
    this.operation = operation;
  }
}

/** Validation errors */
export class ValidationError extends AppError {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', field ? { field } : undefined);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/** Network/connectivity errors */
export class NetworkError extends AppError {
  readonly retryable: boolean;

  constructor(message: string, retryable: boolean = true) {
    super(message, 'NETWORK_ERROR', { retryable });
    this.name = 'NetworkError';
    this.retryable = retryable;
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Extract a user-friendly message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Parse API errors into specific error types
 */
export function parseAPIError(error: unknown, provider: string): APIError {
  const message = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number })?.status;

  // Check for quota/credit errors
  if (
    message.includes('insufficient_quota') ||
    message.includes('quota') ||
    message.includes('credit balance is too low')
  ) {
    return new QuotaError(
      `API Credits Low: Your ${provider} API quota has been exceeded. Please add credits or upgrade your plan.`,
      provider
    );
  }

  // Check for authentication errors
  if (
    status === 401 ||
    message.includes('authentication') ||
    message.includes('Incorrect API key') ||
    message.includes('invalid_api_key')
  ) {
    return new AuthError(
      `Authentication Failed: Your ${provider} API key may be invalid. Please check your API key in Settings.`,
      provider
    );
  }

  // Check for rate limit errors
  if (status === 429 || message.includes('rate limit')) {
    return new QuotaError(
      `Rate limit exceeded for ${provider}. Please try again in a moment.`,
      provider
    );
  }

  // Generic API error
  return new APIError(message, 'API_ERROR', { status, provider });
}

/**
 * Wrap an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: AppError) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const appError = isAppError(error)
      ? error
      : new AppError(getErrorMessage(error), 'UNKNOWN_ERROR');

    if (errorHandler) {
      errorHandler(appError);
    }

    throw appError;
  }
}
