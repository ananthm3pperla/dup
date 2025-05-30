import { useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '../logger';
import { useRetry } from './useRetry';

interface ErrorHandlerConfig {
  showToast?: boolean;
  retryConfig?: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
  };
}

export function useErrorHandler(config: ErrorHandlerConfig = {}) {
  const { showToast = true, retryConfig } = config;
  const { retry } = useRetry(retryConfig);

  const handleError = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage: string = 'An error occurred'
  ): Promise<T> => {
    try {
      if (retryConfig) {
        return await retry(operation);
      } else {
        return await operation();
      }
    } catch (error) {
      // Log error
      logger.error(errorMessage, error);

      // Show toast if enabled
      if (showToast) {
        toast.error(
          error instanceof Error ? error.message : errorMessage
        );
      }

      throw error;
    }
  }, [retry, showToast]);

  return {
    handleError
  };
}