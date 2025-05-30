import React from 'react';
import { AlertCircle, Loader, RefreshCw, FileQuestion } from 'lucide-react';

type StatusType = 'loading' | 'error' | 'empty';

interface StatusDisplayProps {
  type: StatusType;
  title?: string;
  message: string;
  icon?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}

export default function StatusDisplay({
  type,
  title,
  message,
  icon,
  onRetry,
  className = ''
}: StatusDisplayProps) {
  // Default icons based on type
  const defaultIcon = {
    loading: <Loader className="h-12 w-12 animate-spin text-primary" />,
    error: <AlertCircle className="h-12 w-12 text-error" />,
    empty: <FileQuestion className="h-12 w-12 text-muted" />
  };

  // Default titles based on type
  const defaultTitle = {
    loading: 'Loading',
    error: 'Error',
    empty: 'No data found'
  };

  return (
    <div className={`min-h-[200px] flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="mb-4">
        {icon || defaultIcon[type]}
      </div>
      
      <h3 className="text-lg font-medium text-default mb-2">
        {title || defaultTitle[type]}
      </h3>
      
      <p className="text-sm text-muted max-w-md">{message}</p>
      
      {type === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
}