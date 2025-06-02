const API_BASE_URL = '/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'manager' | 'hr';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'employee' | 'manager' | 'hr';
}

export async function loginUser(credentials: LoginCredentials): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  return data.user;
}

export async function registerUser(credentials: RegisterCredentials): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data = await response.json();
  return data.user;
}

export async function logoutUser(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
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
}

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch (error) {
    return false;
  }
}

// Legacy aliases for backward compatibility
export const login = loginUser;
export const signUp = registerUser;
export const signOut = logoutUser;

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