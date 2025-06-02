/**
 * Authentication utilities for Hi-Bridge
 * Uses Replit Database for user management
 */
import { Database } from './database';
import bcrypt from 'bcrypt';
import { User, LoginCredentials, SignupData } from '../types';

const db = Database;

/**
 * Create a new user account
 */
export async function signupUser(data: SignupData): Promise<User> {
  try {
    // Check if user already exists
    const existingUser = await db.get(`user:${data.email}`);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user object
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      name: data.name,
      role: data.role || 'employee',
      avatar_url: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0084ff&color=fff`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_verified: false,
      team_id: data.team_id
    };

    // Store user
    await db.set(`user:${data.email}`, user);
    await db.set(`user_password:${data.email}`, hashedPassword);

    return user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(credentials: LoginCredentials): Promise<User> {
  try {
    const user = await db.get(`user:${credentials.email}`);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const hashedPassword = await db.get(`user_password:${credentials.email}`);
    if (!hashedPassword) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(credentials.password, hashedPassword);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.last_login = new Date().toISOString();
    await db.set(`user:${credentials.email}`, user);

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // Search through all users to find by ID
    const keys = await db.list('user:');
    for (const key of keys) {
      const user = await db.get(key);
      if (user && user.id === userId) {
        return user;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  try {
    // Find user by ID first
    const keys = await db.list('user:');
    let userKey = null;
    let user = null;

    for (const key of keys) {
      const userData = await db.get(key);
      if (userData && userData.id === userId) {
        userKey = key;
        user = userData;
        break;
      }
    }

    if (!user || !userKey) {
      throw new Error('User not found');
    }

    // Update user
    const updatedUser = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString()
    };

    await db.set(userKey, updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Logout user (for consistency, though stateless)
 */
export async function logoutUser(): Promise<void> {
  // In a stateless system, logout is handled client-side
  // by removing stored session data
}

// Legacy alias for compatibility
export const login = loginUser;