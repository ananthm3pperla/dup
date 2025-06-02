import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Building2, ChevronLeft, Beaker } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button, Alert } from "@/components/ui";
import { SignupForm, SocialLoginButtons } from "@/components/auth";
import { toast } from "sonner";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    user,
    signUp,
    signInWithGoogle,
    signInWithMicrosoft,
    error: authError,
    enterDemoMode,
  } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoOption, setShowDemoOption] = useState(false);
  const [isEnteringDemo, setIsEnteringDemo] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      navigate(redirectTo);
    }
  }, [user, navigate, searchParams]);

  const handleSubmit = async (
    name: string,
    email: string,
    password: string,
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Signup form data:", { name, email });

      await signUp(email, password, name);
      // Success - navigate to callback or onboarding
      navigate("/auth/callback", { replace: true });
    } catch (err) {
      console.error("Signup error:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again later.";

      // Show error message
      setError(errorMessage);

      // If database error or unexpected failure, show demo option
      if (
        errorMessage.toLowerCase().includes("database") ||
        errorMessage.toLowerCase().includes("technical difficulties") ||
        errorMessage.toLowerCase().includes("unexpected")
      ) {
        setShowDemoOption(true);
        toast.error(
          "Registration service is currently experiencing issues. Try demo mode to explore the app.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Auth state change will handle navigation
    } catch (err) {
      console.error("Google signup error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to sign up with Google",
      );
    }
  };

  // Handle Microsoft sign in
  const handleMicrosoftSignIn = async () => {
    try {
      await signInWithMicrosoft();
      // Auth state change will handle navigation
    } catch (err) {
      console.error("Microsoft signup error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to sign up with Microsoft",
      );
    }
  };

  // Enter demo mode
  const handleDemoMode = async () => {
    setIsEnteringDemo(true);
    try {
      toast.info("Entering demo mode...");
      await enterDemoMode();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error entering demo mode:", error);
      setError("Failed to enter demo mode. Please try again.");
    } finally {
      setIsEnteringDemo(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          className="flex justify-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Building2 className="h-12 w-12 text-primary" />
        </motion.div>
        <motion.h2
          className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Create your account
        </motion.h2>
        <motion.p
          className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Join Hi-Bridge to manage your team's hybrid work schedule
        </motion.p>

        <motion.div
          className="mt-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to home page
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="bg-white dark:bg-gray-800 px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {showDemoOption && (
            <Alert
              variant="warning"
              title="Registration Issues Detected"
              className="mb-6"
            >
              <p className="mb-2">
                Our database is currently experiencing issues. You can:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 mb-4">
                <li>Try again later</li>
                <li>Use social login instead</li>
                <li>Try demo mode to explore the application</li>
              </ul>
              <Button
                onClick={handleDemoMode}
                className="w-full bg-success hover:bg-success-dark text-white"
                leftIcon={<Beaker className="h-4 w-4" />}
                isLoading={isEnteringDemo}
                disabled={isEnteringDemo}
              >
                Try Demo Mode
              </Button>
            </Alert>
          )}

          {/* SSO Buttons */}
          <SocialLoginButtons
            onGoogleLogin={handleGoogleSignIn}
            onMicrosoftLogin={handleMicrosoftSignIn}
            isSubmitting={isSubmitting}
          />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Email Signup Form */}
          <div className="mt-6">
            <SignupForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={
                error ||
                (authError instanceof Error ? authError.message : undefined)
              }
            />
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary-light dark:hover:text-primary-light flex items-center justify-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to login</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{" "}
            <a
              href="#"
              className="text-primary hover:text-primary-light dark:hover:text-primary-light"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-primary hover:text-primary-light dark:hover:text-primary-light"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
