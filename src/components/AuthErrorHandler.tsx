import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button } from "@/components/ui";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { isDemoMode } from "@/lib/demo";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthErrorHandler() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleAuthErrors = () => {
      // In demo mode, ignore auth errors
      if (isDemoMode()) {
        return;
      }

      // Check for invalid session
      const sessionData = localStorage.getItem("hibridge_session");
      if (!sessionData && user) {
        setAuthError("Your session is invalid. Please sign in again.");
      }

      // Listen for storage events (session changes in other tabs)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "hibridge_session" && !e.newValue && user) {
          setAuthError("You have been signed out in another tab.");
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    };

    return handleAuthErrors();
  }, [user]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Check if session can be restored
      const sessionData = localStorage.getItem("hibridge_session");
      if (sessionData) {
        // Session exists, clear error
        setAuthError(null);
        toast.success("Session restored");
      } else {
        // No session, redirect to login
        await signOut();
        navigate("/auth/login");
      }
    } catch (error) {
      console.error("Error retrying auth:", error);
      toast.error("Failed to restore session");
      navigate("/auth/login");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setAuthError(null);
      navigate("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
      // Force sign out even if it fails
      localStorage.removeItem("hibridge_session");
      navigate("/auth/login");
    }
  };

  if (!authError) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Authentication Error
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {authError}
          </p>
          <div className="mt-3 flex space-x-2">
            <Button
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isRetrying ? "animate-spin" : ""}`}
              />
              {isRetrying ? "Retrying..." : "Retry"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSignOut}
              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
            >
              Sign In Again
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
}
