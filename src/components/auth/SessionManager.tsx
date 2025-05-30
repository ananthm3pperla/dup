import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { refreshSession } from '@/lib/supabase';
import { toast } from 'sonner';
import SessionExpiredDialog from './SessionExpiredDialog';
import { isDemoMode } from '@/lib/demo';

// Time in milliseconds
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface SessionManagerProps {
  children: React.ReactNode;
}

export default function SessionManager({ children }: SessionManagerProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionExpiryTime, setSessionExpiryTime] = useState<number | null>(null);

  // Check session validity periodically
  useEffect(() => {
    if (!user) return;
    
    // Skip session checks in demo mode
    if (isDemoMode()) return;

    const checkSession = async () => {
      try {
        // Get session from Supabase
        const { success, session } = await refreshSession();
        
        if (success && session) {
          // Set expiry time if available
          if (session.expires_at) {
            const expiryTime = new Date(session.expires_at).getTime();
            setSessionExpiryTime(expiryTime);
            
            // If session is about to expire, show warning
            const timeUntilExpiry = expiryTime - Date.now();
            if (timeUntilExpiry <= WARNING_BEFORE_EXPIRY) {
              setSessionExpired(true);
            }
          }
        } else if (!success && session === undefined) {
          // Handle demo mode or missing session gracefully
          console.log('Session not available - possibly in demo mode');
        } else {
          // No session found
          setSessionExpired(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Don't set session expired in demo mode
        if (!(error instanceof Error && error.message.includes('demo mode'))) {
          setSessionExpired(true);
        }
      }
    };

    // Initial check
    checkSession();

    // Set up interval for checking
    const intervalId = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [user]);

  // Handle session refresh
  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      const { success } = await refreshSession();
      
      if (success) {
        setSessionExpired(false);
        toast.success('Session refreshed successfully');
      } else {
        // If refresh fails, sign out
        await handleSignOut();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast.error('Failed to refresh session');
      await handleSignOut();
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
      // Force reload as a last resort
      window.location.href = '/login';
    }
  };

  return (
    <>
      {children}
      
      <SessionExpiredDialog
        isOpen={sessionExpired}
        onRefresh={handleRefreshSession}
        onLogout={handleSignOut}
        isRefreshing={isRefreshing}
      />
    </>
  );
}