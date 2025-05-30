import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isBusy?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading, 
    isBusy,
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary',
      secondary: 'bg-secondary text-white hover:bg-secondary/90 focus-visible:ring-secondary',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary',
      ghost: 'hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary',
      danger: 'bg-error text-white hover:bg-error/90 focus-visible:ring-error',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-11 px-6 text-base',
    };

    const isDisabled = disabled || isLoading || isBusy;

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isDisabled && 'cursor-not-allowed',
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading || isBusy}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export type { ButtonProps };
export default Button;

export { Button }