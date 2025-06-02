import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Building2,
  ChevronLeft,
  AlertCircle,
  DoorOpen,
  Beaker,
} from "lucide-react";
import { Card, Alert, Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { z } from "zod";
import { motion } from "framer-motion";
import { validateTeamInvite } from "@/lib/team";
import InviteCodeForm from "./components/InviteCodeForm";
import AccountForm from "./components/AccountForm";
import TeamJoinConfirmation from "./components/TeamJoinConfirmation";
import { toast } from "sonner";

export default function JoinTeam() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signUp, enterDemoMode } = useAuth();
  const { joinTeam } = useTeam();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    inviteCode: "",
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [teamInfo, setTeamInfo] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [isEnteringDemo, setIsEnteringDemo] = useState(false);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;

    if (formData.password.length >= 8) strength += 1;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;

    setPasswordStrength(strength);
  }, [formData.password]);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      // If logged in, skip account creation step
      setStep(2);
    }

    // Check if we have a state with invite code from location
    if (location.state?.inviteCode) {
      setFormData((prev) => ({
        ...prev,
        inviteCode: location.state.inviteCode,
      }));
    }

    // Check if we have a code in the URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setFormData((prev) => ({ ...prev, inviteCode: code }));
    }
  }, [user, location.state]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Extract invite code from a full URL if needed
  const extractInviteCode = (input: string): string => {
    // Check if it's a URL
    if (input.startsWith("http")) {
      try {
        const url = new URL(input);
        // Check for code in query params
        const code = url.searchParams.get("code");
        if (code) return code;

        // Check for code in path (e.g., /join-team/CODE)
        const pathParts = url.pathname.split("/");
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && lastPart.length >= 6) return lastPart;

        // Return original if no code found
        return input;
      } catch (e) {
        // If URL parsing fails, return the original input
        return input;
      }
    }

    // Not a URL, return as is
    return input;
  };

  // Validate invite code
  const validateInviteCode = async () => {
    // First extract code if it's a full URL
    const cleanCode = extractInviteCode(formData.inviteCode.trim());

    if (!cleanCode) {
      setErrors({ inviteCode: "Invite code is required" });
      return false;
    }

    setValidationInProgress(true);

    try {
      const result = await validateTeamInvite(cleanCode);

      if (!result.valid || !result.team) {
        setErrors({ inviteCode: result.message || "Invalid invite code" });
        return false;
      }

      // Store team info for later
      setTeamInfo(result.team);

      // Update form data with clean code
      setFormData((prev) => ({ ...prev, inviteCode: cleanCode }));

      return true;
    } catch (err) {
      setErrors({
        inviteCode: "Error validating invite code. Please try again.",
      });
      return false;
    } finally {
      setValidationInProgress(false);
    }
  };

  // Validate account form
  const validateAccountForm = () => {
    const schema = z
      .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[0-9]/, "Password must contain at least one number")
          .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character",
          ),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });

    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          const path = error.path[0] as string;
          newErrors[path] = error.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Handle invite code verification
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const isValid = await validateInviteCode();
      if (!isValid) return;

      // Move to next step or join team directly if logged in
      if (user) {
        // Already logged in, confirm team join
        setStep(2);
      } else {
        // Need to create account
        setStep(2);
      }
    } catch (err) {
      setErrors({
        inviteCode:
          err instanceof Error
            ? err.message
            : "Invalid invite code or error joining team",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle account creation and team join
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAccountForm()) return;

    setIsSubmitting(true);
    try {
      // Create account
      await signUp(formData.email, formData.password, formData.name);

      // Store the invite code in session storage to retrieve after email verification
      window.sessionStorage.setItem("pendingInviteCode", formData.inviteCode);

      toast.success(
        "Account created! Please check your email to verify your account.",
      );

      // Redirect to the verification page
      navigate("/verify-email");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create account",
      );
      setErrors({
        submit: err instanceof Error ? err.message : "Failed to create account",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct team join for logged in users
  const handleDirectJoin = async () => {
    if (!user || !formData.inviteCode.trim()) return;

    setIsSubmitting(true);
    try {
      await joinTeam(formData.inviteCode);
      toast.success(`Successfully joined ${teamInfo?.name || "team"}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error joining team");
      setErrors({
        inviteCode:
          err instanceof Error
            ? err.message
            : "Error joining team with this code",
      });
      // Go back to step 1
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle demo mode
  const handleDemoMode = async () => {
    setIsEnteringDemo(true);
    try {
      await enterDemoMode();
      navigate("/dashboard");
    } catch (err) {
      console.error("Error entering demo mode:", err);
      toast.error("Failed to enter demo mode");
    } finally {
      setIsEnteringDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <Building2 className="h-12 w-12 text-primary" />
          </motion.div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          {user
            ? "Join a Team"
            : step === 1
              ? "Join a Team"
              : "Create Your Account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {user
            ? "Enter your invite code to join your team"
            : step === 1
              ? "Enter your invite code to get started"
              : "Complete your account to join the team"}
        </p>

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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          {/* Step indicator for non-logged in users */}
          {!user && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center ${step >= 1 ? "text-primary" : "text-gray-400"}`}
                >
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700"}`}
                  >
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Invite Code</span>
                </div>
                <div
                  className={`flex-1 mx-4 h-0.5 ${step > 1 ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                ></div>
                <div
                  className={`flex items-center ${step >= 2 ? "text-primary" : "text-gray-400"}`}
                >
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700"}`}
                  >
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Account</span>
                </div>
              </div>
            </div>
          )}

          {errors.submit && (
            <Alert
              variant="error"
              title="Error"
              className="mb-4"
              icon={<AlertCircle className="h-5 w-5" />}
              onClose={() =>
                setErrors((prev) => ({ ...prev, submit: undefined }))
              }
            >
              {errors.submit}
            </Alert>
          )}

          {/* Step 1: Invite Code */}
          {step === 1 && (
            <>
              <InviteCodeForm
                inviteCode={formData.inviteCode}
                onChange={handleChange}
                onSubmit={handleVerifyCode}
                error={errors.inviteCode}
                isSubmitting={isSubmitting || validationInProgress}
                isLoggedIn={!!user}
              />

              {/* Demo mode option */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Don't have an invite code? Try our demo mode instead
                </p>
                <Button
                  variant="outline"
                  onClick={handleDemoMode}
                  isLoading={isEnteringDemo}
                  leftIcon={<Beaker className="h-4 w-4" />}
                  className="mx-auto"
                >
                  Try Demo Mode
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Create Account (only for non-logged in users) */}
          {step === 2 && !user && (
            <AccountForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleCreateAccount}
              onBackClick={() => setStep(1)}
              errors={errors}
              isSubmitting={isSubmitting}
              showPassword={showPassword}
              toggleShowPassword={() => setShowPassword(!showPassword)}
              passwordStrength={passwordStrength}
            />
          )}

          {/* Step 2: Team joining for logged in users */}
          {step === 2 && user && (
            <TeamJoinConfirmation
              user={user}
              inviteCode={formData.inviteCode}
              teamName={teamInfo?.name}
              onJoin={handleDirectJoin}
              onBack={() => setStep(1)}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Footer Links */}
          {!user && step === 2 && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                </span>
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary-light dark:hover:text-primary-light"
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
