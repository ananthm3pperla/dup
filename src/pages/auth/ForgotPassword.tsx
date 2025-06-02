import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Building2,
  Mail,
  AlertCircle,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button, Alert } from "@/components/ui";
import { database } from "@/lib/database";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword, error: authError } = useAuth();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form validation
  const validateEmail = (email: string) => {
    const schema = z.string().email("Please enter a valid email address");
    try {
      schema.parse(email);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send password reset email. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
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
          Reset your password
        </motion.h2>
        <motion.p
          className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Enter your email address to receive a password reset link
        </motion.p>
      </div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="bg-white dark:bg-gray-800 px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {isSuccess ? (
            <Alert
              variant="success"
              title="Password reset link sent"
              icon={<CheckCircle className="h-5 w-5" />}
            >
              <p className="mb-4">
                We've sent a password reset link to{" "}
                <span className="font-medium">{email}</span>. Please check your
                inbox.
              </p>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary hover:text-primary-light dark:hover:text-primary-light"
                >
                  Return to login
                </Link>
              </div>
            </Alert>
          ) : (
            <>
              {(error || authError) && (
                <Alert
                  variant="error"
                  title="Error"
                  className="mb-4"
                  icon={<AlertCircle className="h-5 w-5" />}
                  onClose={() => setError(null)}
                >
                  {error ||
                    (authError instanceof Error
                      ? authError.message
                      : "Authentication error")}
                </Alert>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email address
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail
                        className="h-5 w-5 text-gray-400 dark:text-gray-500"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={handleInputChange}
                      required
                      className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 pl-10 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    Send password reset link
                  </Button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary-light dark:hover:text-primary-light flex items-center justify-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to login</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
