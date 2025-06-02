import React from "react";
import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ToasterProps {
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  duration?: number;
  gap?: number;
  closeButton?: boolean;
  richColors?: boolean;
}

export default function Toaster({
  position = "top-right",
  duration = 3000,
  gap = 8,
  closeButton = true,
  richColors = true,
}: ToasterProps) {
  const { theme } = useTheme();
  const resolvedTheme =
    theme === "dark" || theme === "high-contrast" ? "dark" : "light";

  return (
    <SonnerToaster
      theme={resolvedTheme as "light" | "dark"}
      className="toaster group z-50"
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast",
            "group-[.toaster]:bg-card group-[.toaster]:text-default",
            "group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            "dark:group-[.toaster]:bg-gray-800 dark:group-[.toaster]:border-gray-700",
            "rounded-lg border p-4 shadow-md",
            "animate-in slide-in-from-right-full data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:transition-none",
          ),
          description: "group-[.toast]:text-muted text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white px-3 py-2 text-xs font-medium rounded-md",
          cancelButton:
            "group-[.toast]:bg-card-hover group-[.toast]:text-default px-3 py-2 text-xs font-medium rounded-md",
          closeButton:
            "group-[.toast]:text-muted hover:group-[.toast]:text-default rounded-md p-1 transition-colors",
          success:
            "group-[.toast]:bg-success-bg group-[.toast]:text-success group-[.toast]:border-success/20",
          error:
            "group-[.toast]:bg-error-bg group-[.toast]:text-error group-[.toast]:border-error/20",
          warning:
            "group-[.toast]:bg-warning-bg group-[.toast]:text-warning group-[.toast]:border-warning/20",
          info: "group-[.toast]:bg-info-bg group-[.toast]:text-info group-[.toast]:border-info/20",
        },
      }}
      position={position}
      duration={duration}
      gap={gap}
      closeButton={closeButton}
      richColors={richColors}
    />
  );
}
