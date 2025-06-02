import type { User } from '@/lib/types';

/**
 * Authentication service using Replit backend
 */

const API_BASE = '/api';

/**
 * Login user with email and password
 */
export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  return data.user;
};

/**
 * Alternative login function (alias for backwards compatibility)
 */
export const loginUser = login;

/**
 * Register new user
 */
export const register = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}): Promise<User> => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data = await response.json();
  return data.user;
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Logout failed');
  }
};

/**
 * Get current user session
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
class AuthService {
  private static instance: AuthService;
  private baseURL = '/api/auth';

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<{ user: User }> {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<{ user: User }> {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseURL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await fetch(`${this.baseURL}/me`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Not authenticated');
    }

    return response.json();
  }
}

export const authService = AuthService.getInstance();

// Main API functions
export const loginUser = async (email: string, password: string) => {
  return authService.login(email, password);
};

export const signupUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}) => {
  return authService.register(userData);
};

export const logoutUser = async () => {
  return authService.logout();
};

export const getCurrentUser = async () => {
  try {
    const result = await authService.getCurrentUser();
    return result.user;
  } catch (error) {
    return null;
  }
};

// Legacy aliases for backward compatibility
export const login = loginUser;
export const signUp = signupUser;
export const signOut = logoutUser;

// Check authentication status
export async function checkAuth(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch (error) {
    return false;
  }
}

// Social login stubs (implement when needed)
export async function signInWithGoogle(): Promise<User> {
  throw new Error('Google sign-in not implemented yet');
}

export async function signInWithMicrosoft(): Promise<User> {
  throw new Error('Microsoft sign-in not implemented yet');
}

// Demo mode functions
export function isDemoMode(): boolean {
  return localStorage.getItem('demo-mode') === 'true';
}

export async function enterDemoMode(): Promise<void> {
  localStorage.setItem('demo-mode', 'true');
  // Set demo user data
  localStorage.setItem('demo-user', JSON.stringify({
    id: 'demo-user',
    email: 'demo@hibridge.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'employee',
    createdAt: new Date().toISOString()
  }));
}