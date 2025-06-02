import { database, User } from './database';
import { logger } from './logger';
import { hashPassword, verifyPassword } from './security';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role?: 'employee' | 'manager' | 'hr';
  teamId?: string;
  emailVerified: boolean;
  lastSignIn?: string;
}

export interface AuthSession {
  user: AuthUser;
  sessionId: string;
  expiresAt: number;
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, fullName: string): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    logger.info('Attempting user signup', { email });

    // Check if user already exists
    const existingUser = await database.getUserByEmail(email);
    if (existingUser) {
      return { user: null, error: 'User with this email already exists' };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in database
    const newUser = await database.createUser({
      email,
      fullName,
      role: 'employee',
      isActive: true,
      lastActive: new Date().toISOString()
    });

    // Store password separately (in production, this should be more secure)
    await database.db.set(`user:password:${newUser.id}`, hashedPassword);

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      teamId: newUser.teamId,
      emailVerified: true, // For demo purposes
      lastSignIn: new Date().toISOString(),
    };

    logger.info('User signup successful', { userId: authUser.id, email });
    return { user: authUser, error: null };
  } catch (error) {
    logger.error('Unexpected signup error', { error, email });
    return { user: null, error: 'An unexpected error occurred during signup' };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; session: AuthSession | null; error: string | null }> {
  try {
    logger.info('Attempting user signin', { email });

    // Get user from database
    const user = await database.getUserByEmail(email);
    if (!user) {
      return { user: null, session: null, error: 'Invalid email or password' };
    }

    // Get stored password hash
    const storedHash = await database.db.get(`user:password:${user.id}`);
    if (!storedHash) {
      return { user: null, session: null, error: 'Invalid email or password' };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, storedHash);
    if (!isValidPassword) {
      return { user: null, session: null, error: 'Invalid email or password' };
    }

    // Update last active
    await database.updateUser(user.id, { lastActive: new Date().toISOString() });

    // Create session
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
    const sessionId = await database.createSession(user.id, expiresAt);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      teamId: user.teamId,
      emailVerified: true,
      lastSignIn: new Date().toISOString(),
    };

    const authSession: AuthSession = {
      user: authUser,
      sessionId,
      expiresAt: expiresAt.getTime(),
    };

    logger.info('User signin successful', { userId: authUser.id, email });
    return { user: authUser, session: authSession, error: null };
  } catch (error) {
    logger.error('Unexpected signin error', { error, email });
    return { user: null, session: null, error: 'An unexpected error occurred during signin' };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(sessionId?: string): Promise<{ error: string | null }> {
  try {
    logger.info('Attempting user signout');

    if (sessionId) {
      await database.deleteSession(sessionId);
    }

    // Clear any stored session data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hibridge_session');
      localStorage.removeItem('hibridge_user');
    }

    logger.info('User signout successful');
    return { error: null };
  } catch (error) {
    logger.error('Unexpected signout error', { error });
    return { error: 'An unexpected error occurred during signout' };
  }
}

/**
 * Get the current user session
 */
export async function getCurrentSession(): Promise<{ user: AuthUser | null; session: AuthSession | null; error: string | null }> {
  try {
    // Check for stored session
    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('hibridge_session');
      const storedUser = localStorage.getItem('hibridge_user');

      if (storedSession && storedUser) {
        const sessionData = JSON.parse(storedSession);
        const userData = JSON.parse(storedUser);

        // Verify session is still valid
        const session = await database.getSession(sessionData.sessionId);
        if (session && session.isActive) {
          return {
            user: userData,
            session: sessionData,
            error: null
          };
        }
      }
    }

    return { user: null, session: null, error: null };
  } catch (error) {
    logger.error('Unexpected get session error', { error });
    return { user: null, session: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession(sessionId: string): Promise<{ user: AuthUser | null; session: AuthSession | null; error: string | null }> {
  try {
    logger.info('Attempting session refresh');

    const session = await database.getSession(sessionId);
    if (!session || !session.isActive) {
      return { user: null, session: null, error: 'Session expired' };
    }

    // Get user data
    const user = await database.getUserById(session.userId);
    if (!user) {
      return { user: null, session: null, error: 'User not found' };
    }

    // Create new session
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
    const newSessionId = await database.createSession(user.id, expiresAt);

    // Delete old session
    await database.deleteSession(sessionId);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      teamId: user.teamId,
      emailVerified: true,
      lastSignIn: user.lastActive,
    };

    const authSession: AuthSession = {
      user: authUser,
      sessionId: newSessionId,
      expiresAt: expiresAt.getTime(),
    };

    logger.info('Session refresh successful', { userId: authUser.id });
    return { user: authUser, session: authSession, error: null };
  } catch (error) {
    logger.error('Unexpected session refresh error', { error });
    return { user: null, session: null, error: 'An unexpected error occurred during session refresh' };
  }
}