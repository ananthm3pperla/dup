import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../lib/types';
import { authAPI } from '../lib/api';
import { isDemoMode, getDemoUser } from '../lib/demo';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  enterDemoMode: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const isAuthenticated = !!user;

  const clearError = () => setError(null);

  const refreshUser = async () => {
    try {
      if (isDemo) {
        setUser(getDemoUser());
        return;
      }

      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to refresh user:', err);
      if (err.response?.status === 401) {
        setUser(null);
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to refresh user session');
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode()) {
        // Demo mode login
        setUser(getDemoUser());
        setIsDemo(true);
        toast.success('Logged in to demo mode');
        return;
      }

      const userData = await authAPI.login(email, password);
      setUser(userData);
      toast.success('Successfully logged in');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode()) {
        // Demo mode registration
        setUser(getDemoUser());
        setIsDemo(true);
        toast.success('Account created in demo mode');
        return;
      }

      const newUser = await authAPI.register(userData);
      setUser(newUser);
      toast.success('Account created successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isDemo) {
        await authAPI.logout();
      }

      setUser(null);
      setIsDemo(false);
      toast.success('Logged out successfully');
    } catch (err: any) {
      console.error('Logout error:', err);
      // Still clear user state even if API call fails
      setUser(null);
      setIsDemo(false);
      toast.error('Logout failed, but you have been signed out locally');
    } finally {
      setLoading(false);
    }
  };

  const enterDemoMode = () => {
    setUser(getDemoUser());
    setIsDemo(true);
    setError(null);
    toast.success('Entered demo mode');
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Check if already in demo mode
        if (isDemoMode()) {
          setUser(getDemoUser());
          setIsDemo(true);
          return;
        }

        // Try to get current user from server
        await refreshUser();
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Don't set error here, let user try to login
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Session refresh interval
  useEffect(() => {
    if (!user || isDemo) return;

    const interval = setInterval(async () => {
      try {
        await authAPI.refreshSession();
      } catch (err) {
        console.error('Session refresh failed:', err);
        // Don't automatically log out, let the user handle it
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, [user, isDemo]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isDemo,
    login,
    register,
    logout,
    enterDemoMode,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, useAuth };