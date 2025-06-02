import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "outline"
    | "primary";
  size?: "sm" | "md" | "lg";
}

export default function Badge({
  variant = "default",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-primary/10 text-primary dark:bg-primary/20",
    primary: "bg-primary text-white",
    success: "bg-success/10 text-success dark:bg-success/20",
    warning: "bg-warning/10 text-warning dark:bg-warning/20",
    error: "bg-error/10 text-error dark:bg-error/20",
    info: "bg-info/10 text-info dark:bg-info/20",
    outline: "border border-default text-muted bg-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
