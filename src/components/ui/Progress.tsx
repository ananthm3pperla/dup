import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  className?: string;
}

export default function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = false,
  className
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variants = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error'
  };

  return (
    <div className="relative">
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
          sizes[size],
          className
        )}
      >
        <motion.div
          className={cn('h-full rounded-full', variants[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showValue && (
        <div className="absolute right-0 -top-6 text-sm text-gray-500 dark:text-gray-400">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}