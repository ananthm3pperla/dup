import { api } from './api';
import type { User, AuthResponse } from './types';

/**
 * Register a new user
 */
export const registerUser = async (userData: {
  email: string;
  password: string;
  full_name: string;
  role?: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

/**
 * Log in user
 */
export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user;
  } catch (error) {
    return null;
  }
};

/**
 * Log out user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Logout failed');
  }
};

/**
 * Refresh session
 */
export const refreshSession = async (): Promise<void> => {
  try {
    await api.post('/auth/refresh');
  } catch (error: any) {
    throw new Error('Session refresh failed');
  }
};

// Alias for compatibility
export const login = loginUser;