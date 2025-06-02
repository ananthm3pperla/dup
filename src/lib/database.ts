/**
 * Replit Database Integration for Hi-Bridge
 * Uses Replit's built-in key-value database for data persistence
 */

import pkg from "@replit/database";
const Database = pkg.default || pkg;

// Initialize Replit Database
const db = new Database();

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "employee" | "manager" | "hr";
  teamId?: string;
  createdAt: string;
  lastActive: string;
  avatar?: string;
  location?: string;
  isActive: boolean;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  memberIds: string[];
  settings: {
    anchorDays: string[];
    pulseEnabled: boolean;
    gamificationEnabled: boolean;
  };
  createdAt: string;
}

export interface PulseCheck {
  id: string;
  userId: string;
  teamId: string;
  rating: number;
  comment?: string;
  date: string;
  submittedAt: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  teamId: string;
  location: "office" | "remote";
  timestamp: string;
  photoUrl?: string;
  verified: boolean;
  points: number;
}

/**
 * Database service class for Hi-Bridge
 */
export class HiBridgeDatabase {
  private db: Database;

  constructor() {
    this.db = db;
  }

  // User operations
  async createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const id = this.generateId();
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isActive: true,
    };

    await this.db.set(`user:${id}`, JSON.stringify(newUser));
    await this.db.set(`user:email:${user.email}`, id);

    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const userData = await this.db.get(`user:${id}`);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const userId = await this.db.get(`user:email:${email}`);
      if (!userId) return null;

      return await this.getUserById(userId);
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const user = await this.getUserById(id);
      if (!user) return null;

      const updatedUser = {
        ...user,
        ...updates,
        lastActive: new Date().toISOString(),
      };

      await this.db.set(`user:${id}`, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  // Team operations
  async createTeam(team: Omit<Team, "id" | "createdAt">): Promise<Team> {
    const id = this.generateId();
    const newTeam: Team = {
      ...team,
      id,
      createdAt: new Date().toISOString(),
    };

    await this.db.set(`team:${id}`, JSON.stringify(newTeam));
    return newTeam;
  }

  async getTeamById(id: string): Promise<Team | null> {
    try {
      const teamData = await this.db.get(`team:${id}`);
      return teamData ? JSON.parse(teamData) : null;
    } catch (error) {
      console.error("Error getting team by ID:", error);
      return null;
    }
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    try {
      const keys = await this.db.list("team:");
      const teams: Team[] = [];

      for (const key of keys) {
        const teamData = await this.db.get(key);
        if (teamData) {
          const team: Team = JSON.parse(teamData);
          if (team.managerId === userId || team.memberIds.includes(userId)) {
            teams.push(team);
          }
        }
      }

      return teams;
    } catch (error) {
      console.error("Error getting user teams:", error);
      return [];
    }
  }

  // Pulse check operations
  async createPulseCheck(
    pulseCheck: Omit<PulseCheck, "id" | "submittedAt">,
  ): Promise<PulseCheck> {
    const id = this.generateId();
    const newPulseCheck: PulseCheck = {
      ...pulseCheck,
      id,
      submittedAt: new Date().toISOString(),
    };

    await this.db.set(`pulse:${id}`, JSON.stringify(newPulseCheck));
    await this.db.set(`pulse:user:${pulseCheck.userId}:${pulseCheck.date}`, id);

    return newPulseCheck;
  }

  async getPulseCheck(
    userId: string,
    date: string,
  ): Promise<PulseCheck | null> {
    try {
      const pulseId = await this.db.get(`pulse:user:${userId}:${date}`);
      if (!pulseId) return null;

      const pulseData = await this.db.get(`pulse:${pulseId}`);
      return pulseData ? JSON.parse(pulseData) : null;
    } catch (error) {
      console.error("Error getting pulse check:", error);
      return null;
    }
  }

  async getTeamPulseChecks(
    teamId: string,
    startDate: string,
    endDate: string,
  ): Promise<PulseCheck[]> {
    try {
      const keys = await this.db.list("pulse:");
      const pulseChecks: PulseCheck[] = [];

      for (const key of keys) {
        const pulseData = await this.db.get(key);
        if (pulseData) {
          const pulse: PulseCheck = JSON.parse(pulseData);
          if (
            pulse.teamId === teamId &&
            pulse.date >= startDate &&
            pulse.date <= endDate
          ) {
            pulseChecks.push(pulse);
          }
        }
      }

      return pulseChecks.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    } catch (error) {
      console.error("Error getting team pulse checks:", error);
      return [];
    }
  }

  // Check-in operations
  async createCheckIn(checkIn: Omit<CheckIn, "id">): Promise<CheckIn> {
    const id = this.generateId();
    const newCheckIn: CheckIn = {
      ...checkIn,
      id,
    };

    await this.db.set(`checkin:${id}`, JSON.stringify(newCheckIn));
    return newCheckIn;
  }

  async getUserCheckIns(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<CheckIn[]> {
    try {
      const keys = await this.db.list("checkin:");
      const checkIns: CheckIn[] = [];

      for (const key of keys) {
        const checkInData = await this.db.get(key);
        if (checkInData) {
          const checkIn: CheckIn = JSON.parse(checkInData);
          if (
            checkIn.userId === userId &&
            checkIn.timestamp >= startDate &&
            checkIn.timestamp <= endDate
          ) {
            checkIns.push(checkIn);
          }
        }
      }

      return checkIns.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
    } catch (error) {
      console.error("Error getting user check-ins:", error);
      return [];
    }
  }

  // Session management
  async createSession(userId: string, expiresAt: Date): Promise<string> {
    const sessionId = this.generateId();
    const session = {
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
    };

    await this.db.set(`session:${sessionId}`, JSON.stringify(session));
    return sessionId;
  }

  async getSession(sessionId: string): Promise<any | null> {
    try {
      const sessionData = await this.db.get(`session:${sessionId}`);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        await this.db.delete(`session:${sessionId}`);
        return null;
      }

      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.db.delete(`session:${sessionId}`);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async clearAllData(): Promise<void> {
    try {
      const keys = await this.db.list();
      for (const key of keys) {
        await this.db.delete(key);
      }
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  }
}

// Export singleton instance
export const database = new HiBridgeDatabase();
export default database;
