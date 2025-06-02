/**
 * Replit Database API layer for Hi-Bridge
 * Complete replacement for Supabase functionality
 */

import { database } from './database';
import type { User, Team, PulseCheck, CheckIn } from './types';

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
    role: 'employee' | 'manager' | 'hr';
  }): Promise<ApiResponse<User>> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  },

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; session: any }>> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  },

  async logout(): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get current user' };
    }
  },

  async refreshSession(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Session refresh failed' };
    }
  }
};

/**
 * User API functions
 */
export const userAPI = {
  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  },

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Avatar upload failed' };
    }
  },

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch('/api/users/profile', {
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get profile' };
    }
  }
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
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Team creation failed' };
    }
  },

  async getMyTeams(): Promise<ApiResponse<Team[]>> {
    try {
      const response = await fetch('/api/teams/my');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get teams' };
    }
  },

  async joinTeam(inviteCode: string): Promise<ApiResponse<Team>> {
    try {
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to join team' };
    }
  },

  async updateTeamSettings(teamId: string, settings: any): Promise<ApiResponse<Team>> {
    try {
      const response = await fetch(`/api/teams/${teamId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to update team settings' };
    }
  }
};

/**
 * Pulse check API functions
 */
export const pulseAPI = {
  async submitPulse(pulseData: {
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<PulseCheck>> {
    try {
      const response = await fetch('/api/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pulseData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Pulse submission failed' };
    }
  },

  async getTodaysPulse(): Promise<ApiResponse<PulseCheck | null>> {
    try {
      const response = await fetch('/api/pulse/today');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get today\'s pulse' };
    }
  },

  async getTeamPulseHistory(startDate: string, endDate: string): Promise<ApiResponse<PulseCheck[]>> {
    try {
      const response = await fetch(`/api/pulse/team?start=${startDate}&end=${endDate}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get pulse history' };
    }
  }
};

/**
 * Check-in API functions
 */
export const checkinAPI = {
  async submitCheckin(checkinData: FormData): Promise<ApiResponse<CheckIn>> {
    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        body: checkinData,
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Check-in submission failed' };
    }
  },

  async getCheckinHistory(startDate: string, endDate: string): Promise<ApiResponse<CheckIn[]>> {
    try {
      const response = await fetch(`/api/checkins?start=${startDate}&end=${endDate}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get check-in history' };
    }
  },

  async getTeamCheckins(teamId: string, startDate: string, endDate: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`/api/teams/${teamId}/checkins?start=${startDate}&end=${endDate}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get team check-ins' };
    }
  },

  async getUserCheckins(userId: string, startDate: string, endDate: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`/api/users/${userId}/checkins?start=${startDate}&end=${endDate}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get user check-ins' };
    }
  }
};

/**
 * Schedule API functions
 */
export const scheduleAPI = {
  async updateSchedule(schedule: any): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Schedule update failed' };
    }
  },

  async getSchedule(startDate?: string, endDate?: string): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);

      const response = await fetch(`/api/schedule?${params.toString()}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get schedule' };
    }
  },

  async getTeamSchedule(teamId: string, startDate: string, endDate: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`/api/teams/${teamId}/schedule?start=${startDate}&end=${endDate}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get team schedule' };
    }
  },

  async getAnchorDays(teamId: string, startDate: string, endDate: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`/api/teams/${teamId}/anchor-days?start=${startDate}&end=${endDate}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get anchor days' };
    }
  }
};

/**
 * Analytics API functions
 */
export const analyticsAPI = {
  async getTeamAnalytics(): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/analytics/team');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get team analytics' };
    }
  },

  async getLeaderboard(): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/leaderboard');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get leaderboard' };
    }
  }
};

// Legacy compatibility exports - these will throw errors to help identify remaining Supabase usage
export const supabase = {
  auth: {
    signUp: () => {
      throw new Error('Use authAPI.register instead of supabase.auth.signUp');
    },
    signInWithPassword: () => {
      throw new Error('Use authAPI.login instead of supabase.auth.signInWithPassword');
    },
    signOut: () => {
      throw new Error('Use authAPI.logout instead of supabase.auth.signOut');
    },
    getUser: () => {
      throw new Error('Use authAPI.getCurrentUser instead of supabase.auth.getUser');
    }
  },
  from: () => {
    throw new Error('Use the appropriate API functions instead of supabase.from');
  }
};

// Helper function for session management
export async function refreshSession(): Promise<{ success: boolean; session?: any }> {
  const result = await authAPI.refreshSession();
  return {
    success: result.success,
    session: result.data
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
  analytics: analyticsAPI
};