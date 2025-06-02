import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionExpiryTime, setSessionExpiryTime] = useState<number | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [inactivityTimeout, setInactivityTimeout] = useState<NodeJS.Timeout | null>(null);
  
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

  // Track user activity to detect inactivity
  useEffect(() => {
    if (!user) return;
    
    // Skip inactivity tracking in demo mode
    if (isDemoMode()) return;
    
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
    
    const handleActivity = () => {
      setLastActivity(Date.now());
    };
    
    // Set up activity listeners
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    
    // Check for inactivity
    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      if (timeSinceLastActivity >= INACTIVITY_LIMIT) {
        // User has been inactive for too long
        setSessionExpired(true);
      }
    };
    
    // Set up inactivity check
    const timeoutId = setInterval(checkInactivity, 60 * 1000); // Check every minute
    setInactivityTimeout(timeoutId);
    
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      
      if (inactivityTimeout) {
        clearInterval(inactivityTimeout);
      }
    };
  }, [user, lastActivity]);

  // Reset inactivity timer when location changes (user navigates)
  useEffect(() => {
    setLastActivity(Date.now());
  }, [location.pathname]);

  // Handle session refresh
  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      const { success } = await refreshSession();
      
      if (success) {
        setSessionExpired(false);
        setLastActivity(Date.now());
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