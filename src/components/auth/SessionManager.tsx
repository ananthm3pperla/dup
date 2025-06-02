import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SessionExpiredDialog from './SessionExpiredDialog';
import { isDemoMode } from '@/lib/demo';

// Time in milliseconds
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

interface SessionManagerProps {
  children: React.ReactNode;
}

export default function SessionManager({ children }: SessionManagerProps) {
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionExpiryTime, setSessionExpiryTime] = useState<number | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check session validity
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      try {
        // In demo mode, sessions don't expire
        if (isDemoMode()) {
          return;
        }

        // Check local session
        const sessionData = localStorage.getItem('hibridge_session');
        if (!sessionData) {
          setSessionExpired(true);
          return;
        }

        const { userId, timestamp } = JSON.parse(sessionData);
        const sessionAge = Date.now() - timestamp;

        // Check if session is expired
        if (sessionAge > SESSION_DURATION) {
          setSessionExpired(true);
          return;
        }

        // Calculate expiry time
        const expiryTime = timestamp + SESSION_DURATION;
        setSessionExpiryTime(expiryTime);

        // Show warning if session is about to expire
        const timeUntilExpiry = expiryTime - Date.now();
        if (timeUntilExpiry <= WARNING_BEFORE_EXPIRY && timeUntilExpiry > 0) {
          toast.warning('Your session will expire soon. Please save your work.');
        }

      } catch (error) {
        console.error('Error checking session:', error);
        setSessionExpired(true);
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
    try {
      if (!user) return;

      // Update session timestamp
      const sessionData = {
        userId: user.id,
        timestamp: Date.now()
      };

      localStorage.setItem('hibridge_session', JSON.stringify(sessionData));
      setSessionExpired(false);
      setSessionExpiryTime(Date.now() + SESSION_DURATION);

      toast.success('Session refreshed successfully');
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast.error('Failed to refresh session');
    }
  };

  // Handle session expiry
  const handleSessionExpired = async () => {
    try {
      await signOut();
      navigate('/auth/login', { 
        state: { 
          from: location.pathname,
          message: 'Your session has expired. Please sign in again.' 
        }
      });
    } catch (error) {
      console.error('Error handling session expiry:', error);
      navigate('/auth/login');
    }
  };

  return (
    <>
      {children}
      <SessionExpiredDialog
        open={sessionExpired}
        onRefresh={handleRefreshSession}
        onSignOut={handleSessionExpired}
        expiryTime={sessionExpiryTime}
      />
    </>
  );
}