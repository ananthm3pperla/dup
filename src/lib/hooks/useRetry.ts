import { useState, useCallback } from "react";

interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export function useRetry(config: RetryConfig = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = config;

  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const calculateDelay = useCallback(
    (attempt: number) => {
      const delay = initialDelay * Math.pow(backoffFactor, attempt);
      return Math.min(delay, maxDelay);
    },
    [initialDelay, maxDelay, backoffFactor],
  );

  const retry = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setIsRetrying(true);
      try {
        const result = await fn();
        setAttempts(0);
        return result;
      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          setAttempts(0);
          throw error;
        }

        const delay = calculateDelay(attempts);
        await new Promise((resolve) => setTimeout(resolve, delay));
        setAttempts((prev) => prev + 1);
        return retry(fn);
      } finally {
        setIsRetrying(false);
      }
    },
    [attempts, maxAttempts, calculateDelay],
  );

  return {
    retry,
    attempts,
    isRetrying,
    reset: useCallback(() => setAttempts(0), []),
  };
}
