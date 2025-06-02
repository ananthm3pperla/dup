import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Alert, Button } from '@/components/ui';
import { AlertTriangle, RefreshCw, LifeBuoy } from 'lucide-react';
import { isDemoMode } from '@/lib/demo';

export default function SessionHandler() {
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthError = () => {
      // In demo mode, ignore auth errors
      if (isDemoMode()) {
        return;
      }

      // Check if user session is valid
      const sessionData = localStorage.getItem('hibridge_session');
      if (!sessionData && location.pathname.startsWith('/dashboard')) {
        setError('Your session has expired. Please sign in again.');
      }
    };

    // Check on mount and location changes
    handleAuthError();
  }, [location.pathname]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Attempt to refresh session by checking user data
      const sessionData = localStorage.getItem('hibridge_session');
      if (sessionData) {
        const { userId } = JSON.parse(sessionData);
        // Update timestamp to extend session
        const updatedSession = {
          userId,
          timestamp: Date.now()
        };
        localStorage.setItem('hibridge_session', JSON.stringify(updatedSession));
        setError(null);
        toast.success('Session refreshed successfully');
      } else {
        throw new Error('No valid session found');
      }
    } catch (err) {
      console.error('Session refresh failed:', err);
      setError('Failed to refresh session. Please sign in again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth/login');
    } catch (err) {
      console.error('Sign out failed:', err);
      // Force navigation even if sign out fails
      localStorage.removeItem('hibridge_session');
      navigate('/auth/login');
    }
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support chat or email
    toast.info('Support contact feature coming soon');
  };

  if (!error) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Alert className="max-w-md bg-white dark:bg-gray-800">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Session Error
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {error}
          </p>
          <div className="mt-4 flex space-x-2">
            <Button
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSignOut}
            >
              Sign In Again
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleContactSupport}
              className="flex items-center gap-2"
            >
              <LifeBuoy className="h-4 w-4" />
              Support
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
}