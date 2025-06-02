/**
 * Team management functions for Hi-Bridge
 * Uses Replit Database through API endpoints
 */

import { teamAPI } from "./supabase";
import { isDemoMode } from "./demo";

// Validate a team invite code
export async function validateTeamInvite(inviteCode: string): Promise<{
  valid: boolean;
  team?: {
    id: string;
    name: string;
    description?: string;
  };
  message?: string;
}> {
  try {
    if (isDemoMode()) {
      // Mock validation for demo
      if (inviteCode === "DEMO123") {
        return {
          valid: true,
          team: {
            id: "demo-team",
            name: "Demo Team",
            description: "A demo team for testing",
          },
        };
      }
      return { valid: false, message: "Invalid demo invite code. Try DEMO123" };
    }

    // Use API to validate invite
    const response = await fetch(
      `/api/teams/validate-invite?code=${inviteCode}`,
    );
    const result = await response.json();

    if (!result.success) {
      return { valid: false, message: result.error || "Invalid invite code" };
    }

    return { valid: true, team: result.data };
  } catch (error) {
    console.error("Error validating team invite:", error);
    return { valid: false, message: "Failed to validate invite code" };
  }
}

// Join a team with an invite code
export async function joinTeamWithInvite(
  userId: string,
  inviteCode: string,
): Promise<{
  success: boolean;
  team?: {
    id: string;
    name: string;
  };
  message: string;
}> {
  try {
    if (isDemoMode()) {
      // Mock joining for demo
      if (inviteCode === "DEMO123") {
        return {
          success: true,
          team: {
            id: "demo-team",
            name: "Demo Team",
          },
          message: "Successfully joined demo team",
        };
      }
      return { success: false, message: "Invalid demo invite code" };
    }

    // Use teamAPI to join team
    const result = await teamAPI.joinTeam(inviteCode);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to join team",
      };
    }

    return {
      success: true,
      team: result.data,
      message: "Successfully joined team",
    };
  } catch (error) {
    console.error("Error joining team:", error);
    return { success: false, message: "Failed to join team" };
  }
}

// Create a new team
export async function createNewTeam(teamData: {
  name: string;
  description?: string;
}): Promise<{
  success: boolean;
  team?: any;
  message: string;
}> {
  try {
    if (isDemoMode()) {
      return {
        success: true,
        team: {
          id: "demo-team-new",
          name: teamData.name,
          description: teamData.description,
          invite_code: "DEMO456",
        },
        message: "Demo team created successfully",
      };
    }

    const result = await teamAPI.createTeam(teamData);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to create team",
      };
    }

    return {
      success: true,
      team: result.data,
      message: "Team created successfully",
    };
  } catch (error) {
    console.error("Error creating team:", error);
    return { success: false, message: "Failed to create team" };
  }
}

// Get user's teams
export async function getUserTeams(): Promise<{
  success: boolean;
  teams?: any[];
  message?: string;
}> {
  try {
    if (isDemoMode()) {
      return {
        success: true,
        teams: [
          {
            id: "demo-team",
            name: "Demo Team",
            description: "A demo team for testing",
            role: "member",
            invite_code: "DEMO123",
          },
        ],
      };
    }

    const result = await teamAPI.getMyTeams();

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to get teams",
      };
    }

    return {
      success: true,
      teams: result.data,
    };
  } catch (error) {
    console.error("Error getting user teams:", error);
    return { success: false, message: "Failed to get teams" };
  }
}

interface Team {
  id: string;
  name: string;
  description: string;
  requiredDays: number;
  anchorDays: string[];
  createdBy: string;
  createdAt: string;
  members: string[];
  inviteCode: string;
}

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  points: number;
  remoteDays: number;
}

interface AnalyticsData {
  team: Team;
  members: TeamMember[];
  pulseData: any[];
  totalMembers: number;
  avgMood: number;
}

class TeamService {
  async createTeam(
    name: string,
    description: string,
    requiredDays: number,
    anchorDays: string[] = [],
  ): Promise<Team> {
    const response = await fetch("/api/teams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description, requiredDays, anchorDays }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create team");
    }

    return response.json();
  }

  async joinTeam(inviteCode: string): Promise<Team> {
    const response = await fetch("/api/teams/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inviteCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to join team");
    }

    return response.json();
  }

  async getMyTeam(): Promise<Team | null> {
    const response = await fetch("/api/teams/my");

    if (!response.ok) {
      throw new Error("Failed to get team data");
    }

    return response.json();
  }

  async getTeamAnalytics(): Promise<AnalyticsData> {
    const response = await fetch("/api/analytics/team");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get analytics data");
    }

    return response.json();
  }

  async getLeaderboard(): Promise<TeamMember[]> {
    const response = await fetch("/api/leaderboard");

    if (!response.ok) {
      throw new Error("Failed to get leaderboard data");
    }

    return response.json();
  }
}

export const teamService = new TeamService();
export type { Team, TeamMember, AnalyticsData };
