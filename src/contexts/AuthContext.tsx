import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { database } from '../lib/database';
import { hashPassword, verifyPassword } from '../lib/auth';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'manager' | 'hr';
  company_name?: string;
  job_title?: string;
  department?: string;
  office_location?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
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

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = localStorage.getItem('hibridge_session');
        if (sessionData) {
          const { userId } = JSON.parse(sessionData);
          const userData = await database.get(`user_by_id:${userId}`);
          if (userData) {
            setUser(userData as User);
          } else {
            localStorage.removeItem('hibridge_session');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('hibridge_session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      // Check if user already exists
      const existingUser = await database.get(`user:${email}`);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user object
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser: User = {
        id: userId,
        email,
        name: userData.name || '',
        role: userData.role || 'employee',
        company_name: userData.company_name,
        job_title: userData.job_title,
        department: userData.department,
        office_location: userData.office_location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store user data
      await database.set(`user:${email}`, { ...newUser, password: hashedPassword });
      await database.set(`user_by_id:${userId}`, newUser);

      // Create session
      localStorage.setItem('hibridge_session', JSON.stringify({ userId }));
      setUser(newUser);
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Get user data
      const userData = await database.get(`user:${email}`);
      if (!userData) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, userData.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Remove password from user object before setting state
      const { password: _, ...userWithoutPassword } = userData;

      // Create session
      localStorage.setItem('hibridge_session', JSON.stringify({ userId: userData.id }));
      setUser(userWithoutPassword as User);
      toast.success('Welcome back!');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('hibridge_session');
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser: User = {
        ...user,
        ...userData,
        updated_at: new Date().toISOString()
      };

      // Update both user records
      const existingUserData = await database.get(`user:${user.email}`);
      await database.set(`user:${user.email}`, { ...existingUserData, ...userData, updated_at: updatedUser.updated_at });
      await database.set(`user_by_id:${user.id}`, updatedUser);

      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}