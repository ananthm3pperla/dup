import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui";
import { captureError } from "@/lib/errorReporting";

interface ErrorFallbackProps extends FallbackProps {
  errorCode?: number;
}

function ErrorFallback({
  error,
  resetErrorBoundary,
  errorCode,
}: ErrorFallbackProps) {
  // Safe navigation hook that doesn't throw outside Router context
  const safeNavigate = (path: string) => {
    try {
      window.location.href = path;
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  const handleReset = () => {
    resetErrorBoundary();
  };

  const handleNavigateHome = () => {
    // Use window.location for safety
    safeNavigate("/");
  };

  // Log the error details
  React.useEffect(() => {
    captureError(error, {
      path: window.location.pathname,
      errorCode,
      componentStack: error.stack,
    });
  }, [error, errorCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8">
        <div className="flex items-center gap-4 text-error mb-6">
          <div className="rounded-full bg-error/10 p-3 flex-shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {errorCode === 404 ? "Page Not Found" : "Something went wrong"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {errorCode === 404
                ? "We couldn't find the page you're looking for"
                : "We've encountered an unexpected error"}
            </p>
          </div>
        </div>

        <div className="bg-error/10 dark:bg-error/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-error dark:text-error-light font-mono whitespace-pre-wrap break-words">
            {error.message || "An unexpected error occurred"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleNavigateHome}
            leftIcon={<Home className="h-4 w-4" />}
          >
            Go to Home
          </Button>
          <Button
            onClick={handleReset}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export default function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset any state that might have caused the error
        window.sessionStorage.removeItem("error_state");
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
