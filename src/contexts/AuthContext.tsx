import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, refreshSession, signOut } from '@/lib/supabase';
import { isDemoMode, DEMO_USER, cleanupDemoMode, initializeDemoMode } from '@/lib/demo';
import { toast } from 'sonner'; 
import { loginUser, registerUser, requestPasswordReset, signInWithProvider, loginWithDemo } from '@/lib/auth';
import { useRetry } from '@/lib/hooks/useRetry';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  enterDemoMode: () => Promise<void>;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const { retry } = useRetry({ maxAttempts: 3, initialDelay: 1000 });

  useEffect(() => {
    // Initially check if we're in demo mode
    if (isDemoMode()) {
      setUser(DEMO_USER as unknown as User);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting initial session:", sessionError);
          await signOutAndClearData();
          setLoading(false);
          return;
        }
        
        if (session) {
          // Session exists, verify it's valid
          try {
            const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !currentUser) {
              console.warn('Invalid session detected:', userError);
              await signOutAndClearData();
            } else {
              setUser(currentUser);
            }
          } catch (verifyError) {
            console.error('Error verifying user:', verifyError);
            await signOutAndClearData();
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error getting initial session:", err);
        await signOutAndClearData();
        setLoading(false);
      }
    };
    
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Handle specific auth events
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
      
      // Handle refresh token errors
      if (event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }
      
      // Don't override demo user if in demo mode
      if (isDemoMode()) return;
      
      // Update user state based on session
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to clear all local user data and sign out
  const signOutAndClearData = async () => {
    try {
      // Clear any user-related data from localStorage/sessionStorage
      localStorage.removeItem('selectedTeam');
      localStorage.removeItem('userSchedule');
      localStorage.removeItem('votedOfficeDays');
      localStorage.removeItem('scheduleVoteSubmitted');
      localStorage.removeItem('teamSchedule');
      
      // Finally sign out from Supabase - use global scope to clean up all sessions
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clean up demo mode if active
      if (isDemo) {
        cleanupDemoMode();
        setIsDemo(false);
      }
      
      setUser(null);
    } catch (err) {
      console.error('Error in signOutAndClearData:', err);
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Clear any existing tokens before attempting to sign in
      await signOutAndClearData();
      
      const data = await loginUser(email, password);
      
      if (data.user) {
        setUser(data.user);
      }
      return;
    } catch (err) {
      console.error('Error signing in:', err);
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error('Failed to sign in');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      setLoading(true); 
      
      console.log("SignUp data:", { email, fullName });
      
      const result = await retry(async () => {
        return await registerUser(email, password, fullName);
      });
      
      if (result.user) {
        // In development, we can auto-confirm the email
        if (process.env.NODE_ENV === 'development') {
          setUser(result.user);
        } else {
          toast.success('Account created successfully! Please check your email to verify your account.');
        }
      } else {
        toast.success('Account created successfully! Please check your email to verify your account.');
      }
      return result;
    } catch (err) {
      console.error('Error signing up:', err);
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error('Failed to create account');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutHandler = async () => {
    try {
      setError(null);
      setLoading(true);
      
      await signOutAndClearData();
    } catch (err) {
      console.error('Error signing out:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        const error = new Error('Failed to sign out');
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      
      await requestPasswordReset(email);
      
      toast.success('Password reset email sent. Please check your inbox.');
      
    } catch (err) {
      console.error('Error resetting password:', err);
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error('Failed to send password reset email');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      // After successful password update, refresh the session to get new tokens
      await refreshSession();
      
      toast.success('Password updated successfully');
      
    } catch (err) {
      console.error('Error updating password:', err);
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error('Failed to update password');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Use the origin site URL to ensure correct redirects
      const site_url = window.location.origin;

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email || user?.email || '',
        options: {
          emailRedirectTo: `${site_url}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      toast.success('Verification email sent. Please check your inbox.');
      
    } catch (err) {
      console.error('Error resending verification email:', err);
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error('Failed to resend verification email');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Clear any existing tokens before attempting OAuth
      await signOutAndClearData();
      
      // Store the current URL to redirect back after auth
      sessionStorage.setItem('preAuthURL', window.location.href);
      
      await signInWithProvider('google');
      
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign in with Google'));
      toast.error('Failed to sign in with Google. Please try again or use email login.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithMicrosoft = async () => {
    try {
      setLoading(true);
      
      // Clear any existing tokens before attempting OAuth
      await signOutAndClearData();
      
      // Store the current URL to redirect back after auth
      sessionStorage.setItem('preAuthURL', window.location.href);
      
      await signInWithProvider('azure');
      
    } catch (err) {
      console.error('Error signing in with Microsoft:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign in with Microsoft'));
      toast.error('Failed to sign in with Microsoft. Please try again or use email login.');
    } finally {
      setLoading(false);
    }
  };

  const enterDemoMode = async () => {
    try {
      setLoading(true);
      
      // If already in demo mode, just return
      if (isDemo) return;
      
      // Clean up any existing data first
      await signOutAndClearData();
      
      // Clean up any existing demo data
      cleanupDemoMode();
      
      // Initialize demo mode
      initializeDemoMode();
      
      try {
        // Use demo login function
        const demoData = await loginWithDemo();
        if (demoData.user) {
          setUser(demoData.user as User);
        }
        setIsDemo(true);
      } catch (err) {
        // Fallback to static demo user if login fails
        setUser(DEMO_USER as unknown as User);
        setIsDemo(true);
      }
      
      toast.success('Welcome to demo mode! You can explore the app without creating an account.');
      
    } catch (err) {
      console.error('Error entering demo mode:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Failed to enter demo mode'));
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut: signOutHandler,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
    signInWithGoogle,
    signInWithMicrosoft,
    enterDemoMode,
    isDemo 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}