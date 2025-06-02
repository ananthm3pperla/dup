import React, { useState } from "react";
import { Mail, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface EmailVerificationBannerProps {
  email: string;
}

export default function EmailVerificationBanner({
  email,
}: EmailVerificationBannerProps) {
  const { resendVerificationEmail } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle resend verification email
  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await resendVerificationEmail(email);
      toast.success("Verification email sent! Please check your inbox.");
      setCountdown(60); // 60 second cooldown

      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast.error("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-primary/10 dark:bg-primary/20 border-b border-primary/20 dark:border-primary/30"
      >
        <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-primary/20 dark:bg-primary/30">
                <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <p className="ml-3 font-medium text-primary truncate">
                <span className="md:hidden">
                  Please verify your email address
                </span>
                <span className="hidden md:inline">
                  Please verify your email address. Check your inbox at {email}
                </span>
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResend}
                isLoading={isResending}
                disabled={isResending || countdown > 0}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                className="bg-white dark:bg-gray-800"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Email"}
              </Button>
              <button
                type="button"
                className="-mr-1 flex p-2 rounded-md hover:bg-primary/20 dark:hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setIsVisible(false)}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5 text-primary" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
