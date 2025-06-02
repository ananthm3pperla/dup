import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { performanceMonitor } from '@/lib/performance';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const endTimer = performanceMonitor.startTimer('auth_initialization');

      try {
        logger.info('Initializing authentication');
        const { user: currentUser } = await authService.getCurrentUser();

        if (mounted) {
          setUser(currentUser);
          logger.info('User authenticated', { userId: currentUser.id });
        }
      } catch (error) {
        if (mounted) {
          logger.info('No authenticated user found');
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          endTimer({ success: true });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const endTimer = performanceMonitor.startTimer('auth_signin');
    setLoading(true);
    setError(null);

    try {
      logger.info('Attempting user sign in', { email });
      const { user } = await authService.login(email, password);
      setUser(user);
      logger.info('User signed in successfully', { userId: user.id });
      endTimer({ success: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      logger.error('Sign in failed', err as Error, { email });
      setError(errorMessage);
      endTimer({ success: false, error: errorMessage });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: SignUpData) => {
    const endTimer = performanceMonitor.startTimer('auth_signup');
    setLoading(true);
    setError(null);

    try {
      logger.info('Attempting user sign up', { email: userData.email });
      const { user } = await authService.register(userData);
      setUser(user);
      logger.info('User signed up successfully', { userId: user.id });
      endTimer({ success: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      logger.error('Sign up failed', err as Error, { email: userData.email });
      setError(errorMessage);
      endTimer({ success: false, error: errorMessage });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const endTimer = performanceMonitor.startTimer('auth_signout');
    setLoading(true);
    setError(null);

    try {
      logger.info('Attempting user sign out', { userId: user?.id });
      await authService.logout();
      setUser(null);
      logger.info('User signed out successfully');
      endTimer({ success: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      logger.error('Sign out failed', err as Error);
      setError(errorMessage);
      endTimer({ success: false, error: errorMessage });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const endTimer = performanceMonitor.startTimer('auth_refresh');

    try {
      logger.debug('Refreshing user data');
      const { user: currentUser } = await authService.getCurrentUser();
      setUser(currentUser);
      logger.debug('User data refreshed successfully', { userId: currentUser.id });
      endTimer({ success: true });
    } catch (err) {
      logger.warn('Failed to refresh user data', err as Error);
      setUser(null);
      endTimer({ success: false });
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUser,
    clearError,
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