
import { isDemoMode, DEMO_USER } from './demo';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    roles?: string[];
    is_team_leader?: boolean;
  };
}

export interface AuthResponse {
  user: User | null;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  full_name?: string;
}

// API base URL for authentication
const AUTH_API_BASE = '/api/auth';

/**
 * Login user with email and password
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // Demo mode - return demo user
    if (isDemoMode()) {
      return {
        user: {
          id: DEMO_USER.id,
          email: DEMO_USER.email,
          user_metadata: {
            full_name: DEMO_USER.full_name,
            avatar_url: DEMO_USER.avatar_url
          }
        }
      };
    }

    const response = await fetch(`${AUTH_API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      return { user: null, error: data.message || 'Login failed' };
    }

    return { user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, error: 'Network error during login' };
  }
}

/**
 * Register new user
 */
export async function registerUser(credentials: SignupCredentials): Promise<AuthResponse> {
  try {
    if (isDemoMode()) {
      throw new Error('Registration not available in demo mode');
    }

    const response = await fetch(`${AUTH_API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      return { user: null, error: data.message || 'Registration failed' };
    }

    return { user: data.user };
  } catch (error) {
    console.error('Registration error:', error);
    return { user: null, error: 'Network error during registration' };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Demo mode - return demo user
    if (isDemoMode()) {
      return {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        user_metadata: {
          full_name: DEMO_USER.full_name,
          avatar_url: DEMO_USER.avatar_url
        }
      };
    }

    const response = await fetch(`${AUTH_API_BASE}/me`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Logout current user
 */
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    if (isDemoMode()) {
      // In demo mode, just clear local state
      return { success: true };
    }

    const response = await fetch(`${AUTH_API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.message || 'Logout failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Network error during logout' };
  }
}

/**
 * Refresh authentication session
 */
export async function refreshSession(): Promise<{ success: boolean; session?: any }> {
  try {
    if (isDemoMode()) {
      return { 
        success: true, 
        session: {
          user: {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            user_metadata: {
              full_name: DEMO_USER.full_name,
              avatar_url: DEMO_USER.avatar_url
            }
          },
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      };
    }

    const response = await fetch(`${AUTH_API_BASE}/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();
    return { success: true, session: data.session };
  } catch (error) {
    console.error('Session refresh error:', error);
    return { success: false };
  }
}

// Legacy function aliases for compatibility
export const signInWithPassword = loginUser;
export const signUp = registerUser;
export const signOut = logoutUser;
export const login = loginUser;
