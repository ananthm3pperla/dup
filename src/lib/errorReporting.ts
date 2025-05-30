interface ErrorContext {
  path?: string;
  errorCode?: number;
  componentStack?: string;
  userId?: string;
  [key: string]: any;
}

// Track errors for monitoring
export function captureError(error: Error, context: ErrorContext = {}) {
  console.error('Error captured:', error);
  console.info('Error context:', context);

  // In production, we would send this to an error reporting service
  // For example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // Example for Sentry integration
    // Sentry.captureException(error, { extra: context });
    
    // For now, log to console with a note
    console.error('Production Error:', error);
    console.info('Error would be reported to monitoring service with context:', context);
  }
}

// Custom error with status code
export class HttpError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}

// Network error handling
export async function handleApiRequest<T>(
  requestFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    // Convert to our error format for consistency
    if (error instanceof Error) {
      captureError(error);
      throw error;
    } else {
      const newError = new Error('Unknown error occurred during API request');
      captureError(newError);
      throw newError;
    }
  }
}