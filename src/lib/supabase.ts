
/**
 * Replit Database adapter for Hi-Bridge
 * Replaces Supabase functionality with Replit's built-in database
 */

import { Database } from '@replit/database';

// Initialize Replit Database
const db = new Database();

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'manager' | 'hr';
  avatar_url?: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  last_login?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id: string;
  member_ids: string[];
  settings: {
    anchor_days: string[];
    pulse_enabled: boolean;
    gamification_enabled: boolean;
  };
  created_at: string;
}

export interface PulseCheck {
  id: string;
  user_id: string;
  team_id: string;
  rating: number;
  comment?: string;
  date: string;
  submitted_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  team_id: string;
  location: 'office' | 'remote';
  timestamp: string;
  photo_url?: string;
  verified: boolean;
  points: number;
}

/**
 * User management functions
 */
export async function createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  const id = generateId();
  const user: User = {
    ...userData,
    id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await db.set(`user:${id}`, JSON.stringify(user));
  await db.set(`user:email:${userData.email}`, id);
  
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const userData = await db.get(`user:${id}`);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const userId = await db.get(`user:email:${email}`);
    if (!userId) return null;
    
    return await getUserById(userId);
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const user = await getUserById(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString()
    };

    await db.set(`user:${id}`, JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

/**
 * Team management functions
 */
export async function createTeam(teamData: Omit<Team, 'id' | 'created_at'>): Promise<Team> {
  const id = generateId();
  const team: Team = {
    ...teamData,
    id,
    created_at: new Date().toISOString()
  };

  await db.set(`team:${id}`, JSON.stringify(team));
  return team;
}

export async function getTeamById(id: string): Promise<Team | null> {
  try {
    const teamData = await db.get(`team:${id}`);
    return teamData ? JSON.parse(teamData) : null;
  } catch (error) {
    console.error('Error getting team by ID:', error);
    return null;
  }
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  try {
    const keys = await db.list('team:');
    const teams: Team[] = [];

    for (const key of keys) {
      const teamData = await db.get(key);
      if (teamData) {
        const team: Team = JSON.parse(teamData);
        if (team.manager_id === userId || team.member_ids.includes(userId)) {
          teams.push(team);
        }
      }
    }

    return teams;
  } catch (error) {
    console.error('Error getting user teams:', error);
    return [];
  }
}

/**
 * Pulse check functions
 */
export async function createPulseCheck(pulseData: Omit<PulseCheck, 'id' | 'submitted_at'>): Promise<PulseCheck> {
  const id = generateId();
  const pulseCheck: PulseCheck = {
    ...pulseData,
    id,
    submitted_at: new Date().toISOString()
  };

  await db.set(`pulse:${id}`, JSON.stringify(pulseCheck));
  await db.set(`pulse:user:${pulseData.user_id}:${pulseData.date}`, id);
  
  return pulseCheck;
}

export async function getPulseCheck(userId: string, date: string): Promise<PulseCheck | null> {
  try {
    const pulseId = await db.get(`pulse:user:${userId}:${date}`);
    if (!pulseId) return null;

    const pulseData = await db.get(`pulse:${pulseId}`);
    return pulseData ? JSON.parse(pulseData) : null;
  } catch (error) {
    console.error('Error getting pulse check:', error);
    return null;
  }
}

export async function getTeamPulseChecks(teamId: string, startDate: string, endDate: string): Promise<PulseCheck[]> {
  try {
    const keys = await db.list('pulse:');
    const pulseChecks: PulseCheck[] = [];

    for (const key of keys) {
      const pulseData = await db.get(key);
      if (pulseData) {
        const pulse: PulseCheck = JSON.parse(pulseData);
        if (pulse.team_id === teamId && 
            pulse.date >= startDate && 
            pulse.date <= endDate) {
          pulseChecks.push(pulse);
        }
      }
    }

    return pulseChecks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error getting team pulse checks:', error);
    return [];
  }
}

/**
 * Check-in functions
 */
export async function createCheckIn(checkInData: Omit<CheckIn, 'id'>): Promise<CheckIn> {
  const id = generateId();
  const checkIn: CheckIn = {
    ...checkInData,
    id
  };

  await db.set(`checkin:${id}`, JSON.stringify(checkIn));
  return checkIn;
}

export async function getUserCheckIns(userId: string, startDate: string, endDate: string): Promise<CheckIn[]> {
  try {
    const keys = await db.list('checkin:');
    const checkIns: CheckIn[] = [];

    for (const key of keys) {
      const checkInData = await db.get(key);
      if (checkInData) {
        const checkIn: CheckIn = JSON.parse(checkInData);
        if (checkIn.user_id === userId && 
            checkIn.timestamp >= startDate && 
            checkIn.timestamp <= endDate) {
          checkIns.push(checkIn);
        }
      }
    }

    return checkIns.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('Error getting user check-ins:', error);
    return [];
  }
}

/**
 * Session management
 */
export async function createSession(userId: string, expiresAt: Date): Promise<string> {
  const sessionId = generateId();
  const session = {
    user_id: userId,
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    is_active: true
  };

  await db.set(`session:${sessionId}`, JSON.stringify(session));
  return sessionId;
}

export async function getSession(sessionId: string): Promise<any | null> {
  try {
    const sessionData = await db.get(`session:${sessionId}`);
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);
    
    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      await db.delete(`session:${sessionId}`);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await db.delete(`session:${sessionId}`);
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

/**
 * Utility functions
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function clearAllData(): Promise<void> {
  try {
    const keys = await db.list();
    for (const key of keys) {
      await db.delete(key);
    }
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

// Legacy compatibility - export the database instance
export const supabase = {
  auth: {
    signUp: async (data: any) => {
      throw new Error('Use createUser instead');
    },
    signInWithPassword: async (data: any) => {
      throw new Error('Use auth.ts loginUser instead');
    },
    signOut: async () => {
      throw new Error('Use auth.ts logoutUser instead');
    }
  },
  from: (table: string) => {
    throw new Error('Use direct database functions instead');
  }
};

export default db;
