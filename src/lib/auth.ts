import { User } from '@/types';

const API_BASE = '/api';

class AuthService {
  private static instance: AuthService;
  private baseURL = '/api/auth';

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<User> {
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

    const data = await response.json();
    return data.user;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<User> {
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

    const data = await response.json();
    return data.user;
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseURL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseURL}/me`, {
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
}

// Create singleton instance
const authService = AuthService.getInstance();

// Export functions
export const loginUser = (email: string, password: string) => authService.login(email, password);
export const signupUser = (userData: any) => authService.register(userData);
export const logoutUser = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();

// Legacy aliases for backward compatibility
export const login = loginUser;
export const register = signupUser;
export const signUp = signupUser;
export const signOut = logoutUser;
export const logout = logoutUser;

// Check authentication status
export async function checkAuth(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

export default authService;