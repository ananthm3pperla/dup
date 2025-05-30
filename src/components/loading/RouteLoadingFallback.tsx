import React from 'react';
import { LoadingState } from '@/components/ui';

export default function RouteLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingState message="Loading page..." />
    </div>
  );
}