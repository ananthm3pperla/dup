import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/navigation/BackButton";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  showBackButton?: boolean;
  backButtonTo?: string;
  backButtonLabel?: string;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  action,
  showBackButton = false,
  backButtonTo,
  backButtonLabel = "Back",
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 mb-6 sm:mb-8", className)}>
      {showBackButton && (
        <BackButton
          to={backButtonTo}
          label={backButtonLabel}
          className="mb-2"
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
