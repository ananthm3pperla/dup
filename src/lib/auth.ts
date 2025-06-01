interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'employee' | 'manager' | 'hr';
  emailConfirmed: boolean;
  points: number;
  remoteDays: number;
  teamId?: string;
}

interface AuthResponse {
  user: User;
}

class AuthService {
  private baseUrl = '';

  async signUp(email: string, password: string, fullName: string, role: string = 'employee'): Promise<AuthResponse> {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  async signOut(): Promise<void> {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/me');

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to get user data');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      return null;
    }
  }

  async resetPassword(email: string): Promise<void> {
    // Stub for password reset - implement as needed
    console.log('Password reset requested for:', email);
  }

  async updatePassword(newPassword: string): Promise<void> {
    // Stub for password update - implement as needed
    console.log('Password update requested');
  }

  async confirmEmail(token: string): Promise<void> {
    // Stub for email confirmation - implement as needed
    console.log('Email confirmation requested with token:', token);
  }
}

export const authService = new AuthService();

// Export types
export type { User, AuthResponse };
// Auth API functions
export const signUp = async (userData: {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
};

export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
};
export const getCurrentUser = async () => {
  const response = await fetch('/api/auth/me');

  if (!response.ok) {
    throw new Error('Failed to get user data');
  }

  return response.json();
};

export const logout = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  return response.json();
};