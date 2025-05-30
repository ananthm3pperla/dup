import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  variant?: 'default' | 'outline' | 'elevated' | 'filled';
  interactive?: boolean;
  isHoverable?: boolean;
  onClick?: () => void;
}

export function Card({ 
  className, 
  as: Component = 'div', 
  variant = 'default',
  interactive = false,
  isHoverable = false,
  onClick,
  ...props 
}: CardProps) {
  const variantClasses = {
    default: 'bg-card border border-default shadow-sm dark:bg-gray-800 dark:border-gray-700',
    outline: 'bg-transparent border border-default dark:border-gray-700',
    elevated: 'bg-card shadow-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700',
    filled: 'bg-gray-50 dark:bg-gray-800 border border-transparent',
  };

  const baseProps = {
    className: cn(
      'rounded-lg',
      variantClasses[variant],
      isHoverable && 'hover:shadow-md transition-shadow duration-300',
      interactive && 'cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:translate-y-0',
      className
    ),
    onClick,
    ...props
  };

  return <Component {...baseProps} />;
}

Card.Header = function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6 border-b border-default dark:border-gray-700', className)}
      {...props}
    />
  );
};

Card.Title = function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight text-default', className)}
      {...props}
    />
  );
};

Card.Description = function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted', className)}
      {...props}
    />
  );
};

Card.Content = function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props} />
  );
};

Card.Footer = function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0 border-t border-default dark:border-gray-700 mt-2', className)}
      {...props}
    />
  );
};

export function SimpleCard({
  title,
  description,
  children,
  footer,
  className,
  variant = 'default',
  interactive = false,
  isHoverable = false,
  onClick,
  ...props
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'elevated' | 'filled';
  interactive?: boolean;
  isHoverable?: boolean;
  onClick?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      variant={variant}
      interactive={interactive}
      isHoverable={isHoverable}
      onClick={onClick}
      className={className}
      {...props}
    >
      {(title || description) && (
        <Card.Header>
          {title && <Card.Title>{title}</Card.Title>}
          {description && <Card.Description>{description}</Card.Description>}
        </Card.Header>
      )}
      <Card.Content>{children}</Card.Content>
      {footer && <Card.Footer>{footer}</Card.Footer>}
    </Card>
  );
}