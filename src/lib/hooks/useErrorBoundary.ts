import { useState, useCallback } from 'react';

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export function useErrorBoundary() {
  const [state, setState] = useState<ErrorBoundaryState>({
    error: null,
    errorInfo: null
  });

  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    setState({ error, errorInfo });
    
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }, []);

  const resetError = useCallback(() => {
    setState({ error: null, errorInfo: null });
  }, []);

  return {
    error: state.error,
    errorInfo: state.errorInfo,
    handleError,
    resetError
  };
}