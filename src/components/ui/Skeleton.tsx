import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rectangular" | "text";
  animation?: "pulse" | "shimmer" | "none";
}

export default function Skeleton({
  className,
  variant = "default",
  animation = "shimmer",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-gray-200 dark:bg-gray-700 relative overflow-hidden",
        {
          "rounded-md": variant === "default" || variant === "rectangular",
          "rounded-full": variant === "circular",
          "rounded h-4": variant === "text",
        },
        {
          "animate-pulse": animation === "pulse",
          "animate-shimmer": animation === "shimmer",
        },
        className,
      )}
      {...props}
    >
      {animation === "shimmer" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-500/20 to-transparent animate-shimmer" />
      )}
    </div>
  );
}
