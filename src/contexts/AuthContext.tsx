import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { logger } from '@/lib/logger';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role?: 'employee' | 'manager' | 'hr';
  teamId?: string;
  emailVerified?: boolean;
  lastSignIn?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<AuthUser>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      logger.error('Session check failed', { error });
      // Session is invalid or expired
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string = 'employee'): Promise<AuthUser> => {
    try {
      logger.info('Attempting user signup', { email });

      const response = await authAPI.register({
        email,
        password,
        fullName,
        role
      });

      if (response.user) {
        setUser(response.user);
        logger.info('User signup successful', { userId: response.user.id });
        return response.user;
      }

      throw new Error('Signup failed - no user data returned');
    } catch (error: any) {
      logger.error('Signup failed', { error, email });
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthUser> => {
    try {
      logger.info('Attempting user signin', { email });

      const response = await authAPI.login(email, password);

      if (response.user) {
        setUser(response.user);
        logger.info('User signin successful', { userId: response.user.id });
        return response.user;
      }

      throw new Error('Login failed - no user data returned');
    } catch (error: any) {
      logger.error('Signin failed', { error, email });
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      logger.info('Attempting user signout');

      await authAPI.logout();
      setUser(null);

      logger.info('User signout successful');
    } catch (error) {
      logger.error('Signout failed', { error });
      // Even if logout fails on server, clear local state
      setUser(null);
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      await authAPI.refreshSession();
      await checkSession(); // Re-fetch user data
    } catch (error) {
      logger.error('Session refresh failed', { error });
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;