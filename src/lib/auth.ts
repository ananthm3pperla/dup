
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

interface AuthResponse {
  user?: User;
  error?: string;
}

const API_BASE = '/api';

export async function registerUser(email: string, password: string, firstName: string, lastName: string, role: string = 'employee'): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, firstName, lastName, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Registration failed' };
    }

    return { user: data.user };
  } catch (error) {
    return { error: 'Network error during registration' };
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Login failed' };
    }

    return { user: data.user };
  } catch (error) {
    return { error: 'Network error during login' };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/me`);
    
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

// Check authentication status
export async function checkAuth(): Promise<boolean> {
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
