import React from 'react';

interface LoadingFallbackProps {
  message?: string;
}

export default function LoadingFallback({ message = 'Loading...' }: LoadingFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}