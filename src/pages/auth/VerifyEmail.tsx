import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, AlertCircle, CheckCircle, RefreshCw, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button, Alert } from '@/components/ui';
import { database } from '@/lib/database';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, loading, error: authError, resendVerificationEmail } = useAuth();

  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  // Get email from session storage if available
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Redirect if user is already verified
  useEffect(() => {
    if (user && !loading) {
      if (user.email_confirmed_at) {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setError(null);
    setIsResending(true);
    setResendSuccess(false);

    try {
      await resendVerificationEmail(email || '');
      setResendSuccess(true);
      setCountdown(60); // 60 second cooldown
    } catch (err) {
      console.error('Failed to resend verification email:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  // Handle manual verification check
  const handleCheckVerification = () => {
    window.location.reload();
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
          Verify your email
        </motion.h2>
        <motion.p 
          className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          We've sent a verification link to your email address
        </motion.p>
      </div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="bg-white dark:bg-gray-800 px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {(error || authError) && (
            <Alert 
              variant="error"
              title="Error"
              className="mb-4"
              icon={<AlertCircle className="h-5 w-5" />}
              onClose={() => setError(null)}
            >
              {error || (authError instanceof Error ? authError.message : 'Authentication error')}
            </Alert>
          )}

          {resendSuccess && (
            <Alert 
              variant="success"
              title="Verification email sent!"
              className="mb-4"
              icon={<CheckCircle className="h-5 w-5" />}
            >
              <p>Please check your inbox for the verification link.</p>
            </Alert>
          )}

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Verify your email address</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              We've sent a verification link to{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {email || 'your email address'}
              </span>.
              <br />Click the link to verify your account.
            </p>
            <div className="mt-6">
              <Button
                onClick={handleCheckVerification}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                I've verified my email
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Didn't receive the email?
              </p>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending || countdown > 0}
                className="text-sm font-medium text-primary hover:text-primary-light dark:hover:text-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending...' : 
                 countdown > 0 ? `Resend in ${countdown}s` : 
                 'Resend email'}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              If you continue to have issues, please contact{' '}
              <a href="mailto:support@hi-bridge.com" className="font-medium text-primary hover:text-primary-light dark:hover:text-primary-light">
                support@hi-bridge.com
              </a>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-light dark:hover:text-primary-light"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Return to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}