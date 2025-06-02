import { api } from './api';

export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Session {
  id: string;
  expires_at: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

/**
 * Register a new user
 */
export async function registerUser(email: string, password: string, fullName?: string): Promise<AuthResponse> {
  const response = await api.post('/auth/register', {
    email,
    password,
    full_name: fullName
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post('/auth/login', {
    email,
    password
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get('/auth/me');

  if (!response.ok) {
    throw new Error('Failed to get current user');
  }

  const data = await response.json();
  return data.user;
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

/**
 * Refresh user session
 */
export async function refreshSession(): Promise<AuthResponse> {
  const response = await api.post('/auth/refresh');

  if (!response.ok) {
    throw new Error('Failed to refresh session');
  }

  return response.json();
}

/**
 * Store session in localStorage
 */
export function storeSession(session: Session): void {
  localStorage.setItem('hibridge_session', JSON.stringify(session));
}

/**
 * Get stored session from localStorage
 */
export function getStoredSession(): Session | null {
  const stored = localStorage.getItem('hibridge_session');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Clear stored session
 */
export function clearStoredSession(): void {
  localStorage.removeItem('hibridge_session');
}