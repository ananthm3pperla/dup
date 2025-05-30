import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, refreshSession } from '@/lib/supabase';
import { toast } from 'sonner';
import { Alert, Button } from '@/components/ui';
import { AlertTriangle, RefreshCw, LifeBuoy } from 'lucide-react';
import { isDemoMode } from '@/lib/demo';

interface SessionHandlerProps {
  children: React.ReactNode;
}

export default function SessionHandler({ children }: SessionHandlerProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionCheckCount, setSessionCheckCount] = useState(0);
  
  // Set up a periodic session validator to detect token issues
  useEffect(() => {
    // No need to check sessions in demo mode
    if (isDemoMode()) return;
    
    // Only run checks if user is logged in
    if (!user) return;

    let intervalId: number;
    
    const validateSession = async () => {
      try {
        // Try to get the current user to validate session
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.warn('Session validation error:', error.message);
          // Only set the session error if it looks like a token-related issue
          if (error.message.includes('token') || 
              error.message.includes('JWT') || 
              error.message.includes('expired') || 
              error.message.includes('invalid')) {
                
            setSessionError('Your session has expired. Please refresh your session to continue.');
          }
          return;
        }
        
        // If validation succeeded, clear any previous errors
        if (sessionError) {
          setSessionError(null);
        }
        
        // Increment check count for debugging
        setSessionCheckCount(prev => prev + 1);
        
      } catch (err) {
        console.error('Error validating session:', err);
      }
    };
    
    // Run immediate check
    validateSession();
    
    // Set up periodic check every 5 minutes
    intervalId = window.setInterval(validateSession, 5 * 60 * 1000);
    
    return () => {
      window.clearInterval(intervalId);
    };
  }, [user, sessionError]);
  
  // Check for specific error events
  useEffect(() => {
    if (isDemoMode()) return;
    
    const handleTokenError = (event: ErrorEvent) => {
      // Check if this is a token-related error
      if ((event.message && 
          (event.message.includes('token') || 
           event.message.includes('Invalid Refresh Token') ||
           event.message.includes('Not authenticated'))) ||
          (event.error && 
           (event.error.message?.includes('refresh_token') || 
            event.error.message?.includes('JWT expired')))) {
        
        console.warn('Caught auth token error:', event.message);
        setSessionError('Your session has expired. Please refresh your session to continue.');
      }
    };
    
    // Listen for window errors
    window.addEventListener('error', handleTokenError);
    
    // And for unhandled rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && 
         (typeof event.reason.message === 'string') &&
         (event.reason.message.includes('token') || 
          event.reason.message.includes('JWT') ||
          event.reason.message.includes('authentication'))) {
        console.warn('Caught auth promise rejection:', event.reason);
        setSessionError('Your session has expired. Please refresh your session to continue.');
      }
    };
    
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleTokenError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Handle session refresh attempt
  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      const { success, session } = await refreshSession();
      if (success && session) {
        toast.success("Session refreshed successfully!");
        setSessionError(null);
      } else {
        // If no session returned, we need to sign out
        throw new Error("Unable to refresh session");
      }
    } catch (err) {
      console.error("Session refresh failed:", err);
      toast.error("Couldn't refresh your session. Please sign in again.");
      await signOut();
      navigate('/', { replace: true });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle support click
  const handleSupport = () => {
    // This would typically open a support chat or email
    window.open('mailto:support@hi-bridge.com?subject=Session Issue', '_blank');
  };

  // If there's a session error, show the alert with refresh and sign out options
  if (sessionError) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-md px-4">
          <Alert 
            variant="error"
            title="Session Issue"
            icon={<AlertTriangle className="h-5 w-5" />}
          >
            <p className="mb-4">{sessionError}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Button
                size="sm"
                onClick={handleRefreshSession}
                isLoading={isRefreshing}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Refresh Session
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await signOut();
                  navigate('/login', { replace: true });
                }}
              >
                Sign Out
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSupport}
                leftIcon={<LifeBuoy className="h-4 w-4" />}
              >
                Contact Support
              </Button>
            </div>
          </Alert>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}