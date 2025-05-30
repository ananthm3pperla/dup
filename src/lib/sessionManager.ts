import { supabase } from './supabase';
import { toast } from 'sonner';

export interface SessionStatus {
  isValid: boolean;
  expiresAt: number | null;
  remainingTime: number | null;
}

// Check if the current session is valid
export async function checkSessionValidity(): Promise<SessionStatus> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (!data.session) {
      return { isValid: false, expiresAt: null, remainingTime: null };
    }
    
    // Get expiry time from the access token
    const expiresAt = data.session.expires_at ? new Date(data.session.expires_at).getTime() : null;
    const remainingTime = expiresAt ? expiresAt - Date.now() : null;
    
    return {
      isValid: true,
      expiresAt,
      remainingTime
    };
  } catch (error) {
    console.error('Error checking session validity:', error);
    return { isValid: false, expiresAt: null, remainingTime: null };
  }
}

// Refresh the current session
export async function refreshSession(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) throw error;
    
    return !!data.session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
}

// Set up session expiry handling
export function setupSessionExpiryHandling(
  onSessionExpiring: () => void,
  onSessionExpired: () => void
) {
  let expiryWarningTimeout: NodeJS.Timeout;
  let expiryTimeout: NodeJS.Timeout;
  
  // Check session and set up timers
  const checkAndSetupTimers = async () => {
    const { isValid, expiresAt, remainingTime } = await checkSessionValidity();
    
    // Clear existing timers
    clearTimeout(expiryWarningTimeout);
    clearTimeout(expiryTimeout);
    
    if (isValid && expiresAt && remainingTime) {
      // Set warning 5 minutes before expiry
      const warningTime = Math.max(0, remainingTime - 5 * 60 * 1000);
      if (warningTime > 0) {
        expiryWarningTimeout = setTimeout(() => {
          onSessionExpiring();
          toast.warning('Your session will expire soon. Please save your work.', {
            duration: 10000,
            action: {
              label: 'Extend',
              onClick: async () => {
                const refreshed = await refreshSession();
                if (refreshed) {
                  toast.success('Session extended successfully');
                  checkAndSetupTimers();
                } else {
                  toast.error('Failed to extend session');
                }
              },
            },
          });
        }, warningTime);
      }
      
      // Set actual expiry handler
      if (remainingTime > 0) {
        expiryTimeout = setTimeout(() => {
          onSessionExpired();
          toast.error('Your session has expired. Please sign in again.');
        }, remainingTime);
      }
    }
  };
  
  // Initial check
  checkAndSetupTimers();
  
  // Periodically check to handle clock skew, etc.
  const intervalId = setInterval(checkAndSetupTimers, 15 * 60 * 1000);
  
  // Return cleanup function
  return () => {
    clearTimeout(expiryWarningTimeout);
    clearTimeout(expiryTimeout);
    clearInterval(intervalId);
  };
}