/**
 * Replit Database API layer for Hi-Bridge
 * Complete replacement for Supabase functionality
 */

import { database } from "./database";
import type { User, Team, PulseCheck, CheckIn } from "./types";

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Auth API functions
 */
export const authAPI = {
  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    role: "employee" | "manager" | "hr";
  }): Promise<ApiResponse<User>> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: "Registration failed" };
    }
  },

  async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<{ user: User; session: any }>> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  },

  async logout(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: "Logout failed" };
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch("/api/auth/me");
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to get current user" };
    }
  },

  async refreshSession(): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to refresh session" };
    }
  },
};

/**
 * User API functions
 */
export const userAPI = {
  async getProfile(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`/api/users/${userId}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to get user profile" };
    }
  },

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to update profile" };
    }
  },
};

/**
 * Team API functions
 */
export const teamAPI = {
  async createTeam(teamData: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<Team>> {
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to create team" };
    }
  },

  async getTeam(teamId: string): Promise<ApiResponse<Team>> {
    try {
      const response = await fetch(`/api/teams/${teamId}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to get team" };
    }
  },

  async getUserTeams(): Promise<ApiResponse<Team[]>> {
    try {
      const response = await fetch("/api/teams/my");
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to get user teams" };
    }
  },

  async joinTeam(inviteCode: string): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to join team" };
    }
  },
};

/**
 * Pulse check API functions
 */
export const pulseAPI = {
  async submitPulse(pulseData: {
    rating: number;
    comment?: string;
    date: string;
  }): Promise<ApiResponse<PulseCheck>> {
    try {
      const response = await fetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pulseData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to submit pulse check" };
    }
  },

  async getTodayPulse(): Promise<ApiResponse<PulseCheck>> {
    try {
      const response = await fetch("/api/pulse/today");
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to get today's pulse" };
    }
  },
};

/**
 * Check-in API functions
 */
export const checkinAPI = {
  async submitCheckin(formData: FormData): Promise<ApiResponse<CheckIn>> {
    try {
      const response = await fetch("/api/checkins", {
        method: "POST",
        body: formData,
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to submit check-in" };
    }
  },

  async getCheckins(
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<CheckIn[]>> {
    try {
      const response = await fetch(
        `/api/checkins?start=${startDate}&end=${endDate}`,
      );
      return await response.json();
    } catch (error) {
      return { success: false, error: "Failed to get check-ins" };
    }
  },
};

/**
 * Schedule API functions
 */
export const scheduleAPI = {
  getSchedule: async (teamId?: string) => {
    if (isDemoMode()) {
      return { success: true, data: [] };
    }

    try {
      const url = teamId ? `/api/schedule?teamId=${teamId}` : "/api/schedule";
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching schedule:", error);
      return { success: false, error: error.message };
    }
  },

  getTodaySchedule: async () => {
    if (isDemoMode()) {
      return { success: true, data: [] };
    }

    try {
      const response = await fetch("/api/schedule/today", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching today's schedule:", error);
      return { success: false, error: error.message };
    }
  },

  updateSchedule: async (scheduleData: any) => {
    if (isDemoMode()) {
      return { success: true, data: scheduleData };
    }

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error updating schedule:", error);
      return { success: false, error: error.message };
    }
  },
};

/**
 * Analytics API functions
 */
export const analyticsAPI = {
  getTeamMetrics: async (teamId: string, timeRange: string = "week") => {
    if (isDemoMode()) {
      return {
        success: true,
        data: {
          attendance: 85,
          engagement: 78,
          pulseScore: 4.2,
          participationRate: 92,
        },
      };
    }

    try {
      const response = await fetch(
        `/api/analytics/team/${teamId}?range=${timeRange}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching team metrics:", error);
      return { success: false, error: error.message };
    }
  },

  getPersonalMetrics: async (timeRange: string = "week") => {
    if (isDemoMode()) {
      return {
        success: true,
        data: {
          officeVisits: 3,
          pulseAverage: 4.1,
          pointsEarned: 150,
          streakDays: 5,
        },
      };
    }

    try {
      const response = await fetch(`/api/analytics/personal?range=${timeRange}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching personal metrics:", error);
      return { success: false, error: error.message };
    }
  },

  getAIInsights: async () => {
    if (isDemoMode()) {
      return { success: true, data: [] };
    }

    try {
      const response = await fetch("/api/analytics/insights", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      return { success: false, error: error.message };
    }
  },
};

// Helper function for session management
export async function refreshSession(): Promise<{
  success: boolean;
  session?: any;
}> {
  const result = await authAPI.refreshSession();
  return {
    success: result.success,
    session: result.data,
  };
}

// Default export with all API modules
export default {
  auth: authAPI,
  users: userAPI,
  teams: teamAPI,
  pulse: pulseAPI,
  checkins: checkinAPI,
  schedule: scheduleAPI,
  analytics: analyticsAPI,
};