import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Building2, ChevronRight, ChevronLeft, Beaker } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { LoginForm, TwoFactorAuth, SocialLoginButtons } from '@/components/auth';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signInWithGoogle, signInWithMicrosoft, error: authError, enterDemoMode } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnteringDemo, setIsEnteringDemo] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState('');
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    }
  }, [user, navigate, searchParams]);

  const handleSubmit = async (email: string, password: string, rememberMe: boolean) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // For demo purposes, show 2FA for specific email
      if (email === 'demo@example.com') {
        setTwoFactorEmail(email);
        setShowTwoFactor(true);
        setIsSubmitting(false);
        return;
      }
      
      await signIn(email, password);
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to log in. Please check your credentials and try again.');
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
      console.error('Google login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    }
  };

  // Handle Microsoft sign in
  const handleMicrosoftSignIn = async () => {
    try {
      await signInWithMicrosoft();
      // Auth state change will handle navigation
    } catch (err) {
      console.error('Microsoft login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Microsoft');
    }
  };

  // Demo mode - direct signin without credentials
  const handleDemoLogin = async () => {
    setIsEnteringDemo(true);
    try {
      await enterDemoMode();
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Failed to enter demo mode. Please try again.');
    } finally {
      setIsEnteringDemo(false);
    }
  };
  
  // Handle 2FA verification
  const handleVerifyTwoFactor = async (code: string): Promise<boolean> => {
    // In a real app, this would verify the code with your auth provider
    // For demo purposes, we'll just check if the code is '123456'
    if (code === '123456') {
      // Simulate successful login after 2FA
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      return true;
    }
    return false;
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
          Sign in to Hi-Bridge
        </motion.h2>
        <motion.p 
          className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Manage your team's hybrid work schedule
        </motion.p>

        {/* Back to Landing Page Link */}
        <motion.div
          className="mt-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to home page
          </Link>
        </motion.div>
      </div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="bg-white dark:bg-gray-800 px-4 py-8 shadow sm:rounded-lg sm:px-10">
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
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Email Login Form */}
          <div className="mt-6">
            <LoginForm 
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={error || (authError instanceof Error ? authError.message : undefined)}
            />
          </div>

          {/* Demo Login */}
          <div className="mt-6">
            <Button
              onClick={handleDemoLogin}
              disabled={isEnteringDemo}
              isLoading={isEnteringDemo}
              className="w-full flex items-center justify-center gap-2 bg-success hover:bg-success-dark"
            >
              <Beaker className="h-4 w-4" />
              Try Demo Mode
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">New to Hi-Bridge?</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <Link 
                to="/signup" 
                className="font-medium text-primary hover:text-primary-light dark:hover:text-primary-light flex items-center justify-center gap-1"
              >
                <span>Create an account</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary hover:text-primary-light dark:hover:text-primary-light">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:text-primary-light dark:hover:text-primary-light">
              Privacy Policy
            </a>
          </div>
        </div>
      </motion.div>
      
      {/* Two-factor authentication dialog */}
      <TwoFactorAuth 
        isOpen={showTwoFactor}
        onClose={() => setShowTwoFactor(false)}
        onVerify={handleVerifyTwoFactor}
        method="email"
        destination={twoFactorEmail}
      />
    </div>
  );
}