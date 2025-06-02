import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden',
        'hover:shadow-lg active:scale-95',

        // Shimmer effect
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
        'before:translate-x-[-100%] before:transition-transform before:duration-700',
        'hover:before:translate-x-[100%]',

        // Variant styles
        {
          'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary-700 focus-visible:ring-primary shadow-lg hover:shadow-primary/25': variant === 'primary',
          'bg-gradient-to-r from-secondary to-secondary-dark text-white hover:from-secondary-dark hover:to-secondary-700 focus-visible:ring-secondary shadow-lg hover:shadow-secondary/25': variant === 'secondary',
          'border-2 border-primary/30 bg-transparent text-primary hover:bg-primary/5 hover:border-primary/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 focus-visible:ring-primary': variant === 'outline',
          'bg-transparent text-default hover:bg-card-hover/50 backdrop-blur-sm hover:shadow-lg focus-visible:ring-gray-400': variant === 'ghost',
          'bg-gradient-to-r from-error to-error-dark text-white hover:from-error-dark hover:to-error focus-visible:ring-error shadow-lg hover:shadow-error/25': variant === 'destructive',
          'bg-gradient-to-r from-success to-success-dark text-white hover:from-success-dark hover:to-success focus-visible:ring-success shadow-lg hover:shadow-success/25': variant === 'success',
          'bg-white/10 backdrop-blur-md border border-white/20 text-default hover:bg-white/20 hover:border-white/30 shadow-lg focus-visible:ring-white/50': variant === 'glass',
        },

        // Size styles
        {
          'h-8 px-3 text-xs gap-1.5': size === 'sm',
          'h-10 px-4 text-sm gap-2': size === 'md',
          'h-12 px-6 text-base gap-2.5': size === 'lg',
          'h-14 px-8 text-lg gap-3': size === 'xl',
        },
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className={cn('flex items-center gap-2', loading && 'opacity-0')}>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </div>
    </button>
  );
}
export { Button };
export default Button;