import React from 'react';
import StatusDisplay from './ui/StatusDisplay';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <StatusDisplay
      type="error"
      message={message}
      onRetry={onRetry}
    />
  );
}