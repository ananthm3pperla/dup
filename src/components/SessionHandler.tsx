
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, Button } from '@/components/ui';
import { AlertTriangle, RefreshCw, LifeBuoy, LogOut } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function SessionHandler() {
  const { user, error, isDemo, logout, refreshUser, clearError } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSessionError, setShowSessionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Show session error dialog for certain auth errors
    if (error && (error.includes('Session expired') || error.includes('unauthorized'))) {
      setShowSessionError(true);
    }
  }, [error]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshUser();
      setShowSessionError(false);
      setRetryCount(0);
      clearError();
      toast.success('Session refreshed successfully');
    } catch (err) {
      setRetryCount(prev => prev + 1);
      if (retryCount >= 2) {
        toast.error('Multiple refresh attempts failed. Please sign in again.');
        handleSignOut();
      } else {
        toast.error('Refresh failed. Please try again.');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setShowSessionError(false);
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      // Force redirect even if logout fails
      window.location.href = '/login';
    }
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support chat or redirect to support page
    toast.info('Support feature coming soon. Please try refreshing your session.');
  };

  const handleDismiss = () => {
    setShowSessionError(false);
    clearError();
  };

  // Don't show for demo mode or if no error
  if (isDemo || !showSessionError || !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Session Error
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {error}
            </p>
            
            {retryCount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
                Retry attempt {retryCount} of 3
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
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
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign In Again
              </Button>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleContactSupport}
                className="flex items-center gap-2 text-xs"
              >
                <LifeBuoy className="h-3 w-3" />
                Get Help
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
