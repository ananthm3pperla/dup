import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-error mb-4">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Error</span>
        </div>
        <p className="text-sm text-muted mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}