import React from "react";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
  HelpCircle,
} from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "help";
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export default function Alert({
  variant = "default",
  title,
  icon,
  onClose,
  children,
  className,
  ...props
}: AlertProps) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success-bg text-success border-success/20",
    warning: "bg-warning-bg text-warning border-warning/20",
    error: "bg-error-bg text-error border-error/20",
    info: "bg-info-bg text-info border-info/20",
    help: "bg-primary/5 text-primary border-primary/20 dark:bg-primary/10",
  };

  const getIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
      case "help":
        return <HelpCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4",
        variants[variant],
        className,
      )}
      role="alert"
      aria-live="polite"
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            type="button"
            className="flex-shrink-0 rounded-md p-1 hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 -mt-1"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
