import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertCircle, RefreshCw } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: { 
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app p-4">
      <div className="bg-card rounded-lg shadow-lg p-6 max-w-lg w-full">
        <div className="flex items-center gap-3 text-error mb-4">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <h2 className="text-lg font-semibold">Something went wrong</h2>
        </div>
        
        <div className="bg-error/10 rounded p-4 mb-4">
          <pre className="text-sm text-error whitespace-pre-wrap">
            {error.message}
          </pre>
        </div>

        <div className="flex justify-end">
          <button
            onClick={resetErrorBoundary}
            className="btn btn-primary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset any state that might have caused the error
        window.location.href = '/';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}