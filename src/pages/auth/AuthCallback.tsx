import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { authAPI } from '@/lib/supabase';
import { LoadingState, Button, Alert } from '@/components/ui';
import { AlertCircle, Beaker, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, enterDemoMode } = useAuth();
  const { teams, loading: teamLoading } = useTeam();
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'auth' | 'permission' | 'other' | null>(null);
  const [success, setSuccess] = useState(false);
  const [processingStage, setProcessingStage] = useState<'verifying' | 'setting_up' | 'redirecting'>('verifying');

  // Look for error and error_description in the URL parameters or hash
  useEffect(() => {
    // Check URL params
    const urlError = searchParams.get('error');
    const urlErrorDescription = searchParams.get('error_description');
    
    // Also check URL hash (some OAuth providers use the hash)
    const hash = window.location.hash.substring(1); // remove the #
    const hashParams = new URLSearchParams(hash);
    const hashError = hashParams.get('error');
    const hashErrorDescription = hashParams.get('error_description');
    
    // If we have an error from either source, display it
    if (urlError || hashError) {
      const errorMessage = urlErrorDescription || hashErrorDescription || 'Authentication failed';
      setError(decodeURIComponent(errorMessage.replace(/\+/g, ' ')));
      setErrorType('auth');
      
      // We'll let the user return to the previous page after a short delay
      setTimeout(() => {
        // Get the stored pre-auth URL or default to login
        const previousUrl = sessionStorage.getItem('preAuthURL') || '/login';
        navigate(previousUrl);
        sessionStorage.removeItem('preAuthURL');
      }, 5000);
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const setupUser = async () => {
      // If there's an error, we've already handled it in the other useEffect
      if (error) return;
      
      // Need to check if this is a new user
      if (user && !authLoading && !teamLoading) {
        try {
          // Show success animation briefly
          setSuccess(true);
          setProcessingStage('setting_up');
          await new Promise(resolve => setTimeout(resolve, 1000));

          try {
            // FIX: Directly upsert the onboarding record without checking first
            // This eliminates the race condition that could cause duplicate key errors
            const { error: upsertError } = await supabase
              .from('user_onboarding')
              .upsert({
                user_id: user.id,
                onboarding_completed: false
              }, {
                onConflict: 'user_id'
              });
              
            if (upsertError) {
              if (upsertError.code === 'PGRST406') {
                console.error('Permission error creating onboarding record:', upsertError);
                setError('Permission denied creating onboarding data. This may be a temporary issue with our database.');
                setErrorType('permission');
                return;
              } else {
                // Log but continue with onboarding
                console.error('Error upserting onboarding record:', upsertError);
              }
            }
            
            // Get the record to check if onboarding is completed
            const { data: onboardingRecord, error: getError } = await supabase
              .from('user_onboarding')
              .select('onboarding_completed')
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (!getError && onboardingRecord && onboardingRecord.onboarding_completed) {
              // Onboarding is already completed, proceed to next steps
              setProcessingStage('redirecting');
            } else {
              // Needs to complete onboarding
              setProcessingStage('redirecting');
              navigate('/onboarding');
              return;
            }
          } catch (onboardingErr) {
            console.error('Error during onboarding setup:', onboardingErr);
            // Continue with the flow, as we'll catch missing onboarding in the next steps
          }
          
          // Check if there's a pending invite code stored from the join-team flow
          const pendingInviteCode = sessionStorage.getItem('pendingInviteCode');
          if (pendingInviteCode) {
            // Clear it from session storage
            sessionStorage.removeItem('pendingInviteCode');
            // Redirect to join-team with the stored code
            navigate('/join-team', { state: { inviteCode: pendingInviteCode }});
            return;
          }
          
          // Check if user has any teams, if not, they need to create/join one
          if (teams.length === 0) {
            navigate('/teams');
          } else {
            // Returning user with teams, redirect to dashboard
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('Error in auth callback:', err);
          setError('Error setting up your account. Please try refreshing the page or contact support.');
          setErrorType('other');
        }
      } else if (!authLoading && !user) {
        // If no user after auth process, redirect to login
        navigate('/login');
      }
    };
    
    // Only run once auth loading is complete
    if (!authLoading) {
      setupUser();
    }
  }, [user, authLoading, teamLoading, teams, navigate, error]);

  const handleTryDemoMode = async () => {
    try {
      await enterDemoMode();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error entering demo mode:', err);
      toast.error('Failed to enter demo mode');
    }
  };

  // Success animation
  if (success && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center max-w-md"
        >
          <motion.div 
            className="mx-auto rounded-full bg-success/20 p-4 w-24 h-24 flex items-center justify-center mb-4"
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          >
            <Check className="h-12 w-12 text-success" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Successful
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            {processingStage === 'verifying' && "Verifying your account..."}
            {processingStage === 'setting_up' && "Setting up your account..."}
            {processingStage === 'redirecting' && "Redirecting you to your dashboard..."}
          </p>
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <motion.div 
              className="bg-primary h-1.5 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // If there's an error, display it
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex items-center gap-3 text-error mb-4">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Authentication Error</h2>
          </div>
          <Alert
            variant="error"
            title={errorType === 'auth' ? 'Authentication Failed' : 'Setup Error'}
          >
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          </Alert>
          
          {errorType === 'permission' && (
            <div className="mt-6 bg-warning/10 p-4 rounded-lg">
              <p className="text-sm text-warning mb-2">It looks like we're having some database permission issues. You can:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                <li>Try refreshing the page</li>
                <li>Try logging in again later</li>
                <li>Or continue in demo mode to explore the application</li>
              </ul>
              <Button
                onClick={handleTryDemoMode}
                className="w-full"
                leftIcon={<Beaker className="h-4 w-4" />}
              >
                Continue in Demo Mode
              </Button>
            </div>
          )}
          
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {errorType === 'auth' ? 'Redirecting you back to the login page...' : 'Please try again or contact support if the issue persists.'}
          </p>
          
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <LoadingState 
        message="Completing sign in..." 
        variant="pulse"
      />
    </div>
  );
}