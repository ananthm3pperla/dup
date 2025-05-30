import React from 'react';
import StatusDisplay from './ui/StatusDisplay';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <StatusDisplay
      type="loading"
      message={message}
    />
  );
}