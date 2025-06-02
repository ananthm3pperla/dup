import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Building2, AlertCircle, LifeBuoy } from "lucide-react";
import { LoadingState, Button, Alert } from "../components/ui";
import { toast } from "sonner";
import OnboardingFlow from "../components/onboarding/OnboardingFlow";
import AccountSecurity from "../components/auth/AccountSecurity";
import { isDemoMode, getDemoUser } from "../lib/demo";
import { database } from "../lib/database";
import { userAPI } from "../lib/api";

export default function UserOnboarding() {
  const navigate = useNavigate();
  const { user, enterDemoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"profile" | "security">("profile");
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // In demo mode, just proceed with onboarding
        if (isDemoMode()) {
          setLoading(false);
          return;
        }

        // Check if user has already completed onboarding
        const { data, error: queryError } = await database
          .from("user_onboarding")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (queryError) {
          // Don't throw on 'no rows returned' (PGRST116)
          if (queryError.code !== "PGRST116") {
            console.error("Error checking onboarding status:", queryError);

            if (queryError.code === "PGRST406") {
              // Permission error - likely RLS issue
              throw new Error(
                "Permission denied accessing onboarding data. This may be a temporary issue with our database.",
              );
            } else {
              throw new Error("Failed to check onboarding status");
            }
          }

          // If no onboarding record exists, create one
          const { error: insertError } = await database
            .from("user_onboarding")
            .insert({
              user_id: user.id,
              onboarding_completed: false,
            });

          if (insertError) {
            console.error("Error creating onboarding record:", insertError);
            if (insertError.code === "PGRST406") {
              throw new Error(
                "Permission denied creating onboarding data. This may be a temporary issue with our database.",
              );
            }
            throw new Error("Failed to create onboarding record");
          }
        } else if (data?.onboarding_completed) {
          // If user already completed onboarding, redirect to dashboard
          navigate("/dashboard");
          return;
        }

        // Check if user has seen the walkthrough
        setHasSeenWalkthrough(!!localStorage.getItem("hasSeenWalkthrough"));
      } catch (err) {
        console.error("Error in onboarding check:", err);
        setError(
          err instanceof Error
            ? err.message
            : "There was an error checking your onboarding status",
        );
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  const handleProfileComplete = () => {
    setStage("security");
  };

  const handleSecurityComplete = async () => {
    handleOnboardingComplete();
  };

  const handleOnboardingComplete = async () => {
    try {
      if (!user) return;

      // In demo mode, just navigate to dashboard
      if (isDemoMode()) {
        toast.success("Setup complete! Welcome to Hi-Bridge");

        // Set walkthrough flag for first-time users
        if (!hasSeenWalkthrough) {
          localStorage.setItem("hasSeenWalkthrough", "true");
        }

        navigate("/dashboard");
        return;
      }

      // Update user's onboarding status
      const { data, error } = await database
        .from("user_onboarding")
        .upsert(
          {
            user_id: user.id,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        )
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST406") {
          // Handle permission error
          console.error("Permission error completing onboarding:", error);
          // We'll just proceed to dashboard anyway
          toast.warning(
            "Your preferences have been saved but there was an issue updating your profile. Some features might be limited.",
          );
          navigate("/dashboard");
          return;
        }
        throw error;
      }

      // Set walkthrough flag for first-time users
      if (!hasSeenWalkthrough) {
        localStorage.setItem("hasSeenWalkthrough", "true");
      }

      toast.success("Setup complete! Welcome to Hi-Bridge");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error completing onboarding:", err);
      toast.error("Failed to complete setup. Please try again.");
      setError("Failed to complete onboarding");
    }
  };

  const handleTryDemoMode = async () => {
    try {
      await enterDemoMode();
      navigate("/dashboard");
    } catch (err) {
      console.error("Error entering demo mode:", err);
      toast.error("Failed to enter demo mode");
    }
  };

  const handleContactSupport = () => {
    // In a real implementation, this would open a support chat or email
    window.open("mailto:support@hi-bridge.com", "_blank");
  };

  if (loading) {
    return <LoadingState message="Preparing your account setup..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h2>

          <div className="mt-8">
            <Alert
              variant="error"
              title="Error Setting Up Your Account"
              icon={<AlertCircle className="h-5 w-5" />}
            >
              <p className="mb-4">{error}</p>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="primary"
                  size="sm"
                >
                  Try going to Dashboard
                </Button>
                <Button
                  onClick={handleContactSupport}
                  variant="outline"
                  size="sm"
                  leftIcon={<LifeBuoy className="h-4 w-4" />}
                >
                  Contact Support
                </Button>
              </div>
            </Alert>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Having issues? Try our demo mode instead
              </p>
              <Button
                variant="outline"
                onClick={handleTryDemoMode}
                className="mx-auto"
              >
                Try Demo Mode
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "profile") {
    return (
      <OnboardingFlow
        userId={user?.id || ""}
        userEmail={user?.email || ""}
        initialName={user?.user_metadata?.full_name || ""}
        onComplete={handleProfileComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <AccountSecurity
          userId={user?.id || ""}
          onComplete={handleSecurityComplete}
        />
      </div>
    </div>
  );
}