import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      label,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Sanitize input value to prevent XSS
    const sanitizeValue = (value: unknown): unknown => {
      if (typeof value === "string") {
        return value
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }
      return value;
    };

    // Handle value sanitization for controlled inputs
    const sanitizedProps = Object.keys(props).reduce((acc, key) => {
      if (key === "value") {
        return {
          ...acc,
          [key]: sanitizeValue(props[key as keyof typeof props]),
        };
      }
      return { ...acc, [key]: props[key as keyof typeof props] };
    }, {});

    // Generate a random ID if none is provided
    const id = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn("relative", fullWidth ? "w-full" : "")}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-default dark:text-gray-300 mb-1"
          >
            {label}
            {required && (
              <span className="text-error ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            type={type}
            className={cn(
              "flex h-10 rounded-md border border-default bg-card px-3 py-2 text-sm ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted dark:placeholder:text-gray-500",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-error focus-visible:ring-error",
              fullWidth && "w-full",
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${id}-error`
                : helperText
                  ? `${id}-description`
                  : undefined
            }
            required={required}
            disabled={disabled}
            {...sanitizedProps}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            className="mt-1 text-sm text-error animate-shake"
            id={`${id}-error`}
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            className="mt-1 text-xs text-muted dark:text-gray-400"
            id={`${id}-description`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;

export { Input };
