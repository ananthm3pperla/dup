import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertTriangle className="h-6 w-6 flex-shrink-0" />
          <h2 className="text-lg font-semibold">Something went wrong</h2>
        </div>
        
        <div className="bg-red-50 rounded p-4 mb-4">
          <pre className="text-sm text-red-600 whitespace-pre-wrap">
            {error.message}
          </pre>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={resetErrorBoundary}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}