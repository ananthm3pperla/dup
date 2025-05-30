import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, loading, error: authError, resendVerificationEmail } = useAuth();
  
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  // Redirect if user is already verified
  useEffect(() => {
    if (user && !loading) {
      if (user.emailVerified) {
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
      await resendVerificationEmail();
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
    // This would trigger a re-auth or session refresh in a real implementation
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building2 className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification link to your email address
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {(error || authError) && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error || (authError instanceof Error ? authError.message : 'Authentication error')}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Verification email sent!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Please check your inbox for the verification link.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light/10 mb-4">
              <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Verify your email address</h3>
            <p className="mt-1 text-sm text-gray-500">
              We've sent a verification link to your email address.
              Click the link to verify your account.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCheckVerification}
                className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                I've verified my email
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Didn't receive the email?
              </p>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending || countdown > 0}
                className="text-sm font-medium text-primary hover:text-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending...' : 
                 countdown > 0 ? `Resend in ${countdown}s` : 
                 'Resend email'}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs text-center text-gray-500">
              If you continue to have issues, please contact{' '}
              <a href="mailto:support@hi-bridge.com" className="font-medium text-primary hover:text-primary-light">
                support@hi-bridge.com
              </a>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary hover:text-primary-light"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}