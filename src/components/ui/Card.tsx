import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'elevated' | 'interactive';
  hover?: boolean;
}

export function Card({ 
  className, 
  children, 
  padding = 'md',
  variant = 'default',
  hover = false,
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-xl border shadow-lg transition-all duration-300 relative overflow-hidden',

        // Variant styles
        {
          'bg-card/80 backdrop-blur-sm border-default/50 hover:shadow-xl hover:border-primary/30 hover:bg-card/90': variant === 'default',
          'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 hover:border-white/30': variant === 'glass',
          'bg-card shadow-2xl border-default/30 hover:shadow-3xl': variant === 'elevated',
          'bg-card/80 backdrop-blur-sm border-default/50 hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1 cursor-pointer': variant === 'interactive',
        },

        // Hover effects
        hover && 'hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1 cursor-pointer',

        // Padding
        {
          'p-0': padding === 'none',
          'p-3': padding === 'sm', 
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
        },
        className
      )}
      {...props}
    >
      {/* Gradient overlay for glass effect */}
      {variant !== 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}