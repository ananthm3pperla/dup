
import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
  role?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    role: string;
  };
}

export interface AuthResponse {
  user: AuthUser;
}

/**
 * Login user with email and password
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Register new user
 */
export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  try {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Get current user session
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
}

/**
 * Logout current user
 */
export async function logoutUser(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Refresh user session
 */
export async function refreshSession(): Promise<void> {
  try {
    await api.post('/auth/refresh');
  } catch (error) {
    console.error('Refresh session error:', error);
    throw error;
  }
}
