import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button } from '@/components/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { refreshSession, signOut } from '@/lib/supabase';
import { toast } from 'sonner';
import { isDemoMode } from '@/lib/demo';

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

export default function AuthErrorHandler({ children }: AuthErrorHandlerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Listen for auth-related errors
  useEffect(() => {
    // Don't monitor errors in demo mode
    if (isDemoMode()) return;

    const handleTokenErrors = (event: ErrorEvent) => {
      // Look for specific errors related to auth tokens
      const errorMsg = event.message || '';
      const errorStack = event.error?.stack || '';
      
      if (
        errorMsg.includes('refresh_token_not_found') ||
        errorMsg.includes('Invalid Refresh Token') ||
        errorStack.includes('refresh_token') ||
        errorMsg.includes('Invalid login credentials') ||
        errorMsg.includes('Not authenticated')
      ) {
        console.warn('Auth token error detected:', event.message);
        setError('Your session has expired or is invalid. Please refresh or sign in again.');
      }
    };

    // Listen for auth-related errors
    window.addEventListener('error', handleTokenErrors);
    
    // Also handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason || '';
      const stack = event.reason?.stack || '';
      
      if (
        reason.includes('refresh_token') ||
        reason.includes('Invalid token') ||
        reason.includes('JWT expired') ||
        stack.includes('auth') ||
        reason.includes('Not authenticated')
      ) {
        console.warn('Auth promise rejection detected:', reason);
        setError('Your session has expired or is invalid. Please refresh or sign in again.');
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Cleanup listeners
    return () => {
      window.removeEventListener('error', handleTokenErrors);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Handle session refresh
  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    
    try {
      const { success } = await refreshSession();
      
      if (success) {
        setError(null);
        toast.success('Session refreshed successfully');
      } else {
        toast.error('Unable to refresh session. Please sign in again.');
        await signOut();
        navigate('/login');
      }
    } catch (err) {
      console.error('Error refreshing session:', err);
      toast.error('Failed to refresh session. Please sign in again.');
      await signOut();
      navigate('/login');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force a hard reload as a last resort
      window.location.href = '/';
    }
  };

  if (error) {
    return (
      <>
        <div className="fixed top-4 inset-x-0 z-50 mx-auto max-w-md px-4">
          <Alert 
            variant="error"
            title="Authentication Error"
            icon={<AlertTriangle className="h-5 w-5" />}
            onClose={() => setError(null)}
          >
            <p>{error}</p>
            <div className="flex flex-wrap gap-3 mt-4">
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
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </Alert>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
}