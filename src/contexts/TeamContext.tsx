/**
 * Team Context for Hi-Bridge
 * Manages team data and operations using Replit Database
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { database } from "../lib/database";
import { teamAPI } from "../lib/api";
import type { Team, TeamMember, User } from "../lib/types";

interface TeamState {
  currentTeam: Team | null;
  teams: Team[];
  teamMembers: TeamMember[];
  memberDetails: User[];
  isLoading: boolean;
  error: string | null;
}

type TeamAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CURRENT_TEAM"; payload: Team | null }
  | { type: "SET_TEAMS"; payload: Team[] }
  | { type: "SET_TEAM_MEMBERS"; payload: TeamMember[] }
  | { type: "SET_MEMBER_DETAILS"; payload: User[] }
  | { type: "ADD_TEAM"; payload: Team }
  | { type: "UPDATE_TEAM"; payload: Team }
  | { type: "REMOVE_TEAM"; payload: string }
  | { type: "ADD_MEMBER"; payload: TeamMember }
  | { type: "REMOVE_MEMBER"; payload: string };

const initialState: TeamState = {
  currentTeam: null,
  teams: [],
  teamMembers: [],
  memberDetails: [],
  isLoading: false,
  error: null,
};

const teamReducer = (state: TeamState, action: TeamAction): TeamState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "SET_CURRENT_TEAM":
      return { ...state, currentTeam: action.payload };
    case "SET_TEAMS":
      return { ...state, teams: action.payload, isLoading: false };
    case "SET_TEAM_MEMBERS":
      return { ...state, teamMembers: action.payload };
    case "SET_MEMBER_DETAILS":
      return { ...state, memberDetails: action.payload };
    case "ADD_TEAM":
      return { ...state, teams: [...state.teams, action.payload] };
    case "UPDATE_TEAM":
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
        currentTeam:
          state.currentTeam?.id === action.payload.id
            ? action.payload
            : state.currentTeam,
      };
    case "REMOVE_TEAM":
      return {
        ...state,
        teams: state.teams.filter((t) => t.id !== action.payload),
        currentTeam:
          state.currentTeam?.id === action.payload ? null : state.currentTeam,
      };
    case "ADD_MEMBER":
      return { ...state, teamMembers: [...state.teamMembers, action.payload] };
    case "REMOVE_MEMBER":
      return {
        ...state,
        teamMembers: state.teamMembers.filter((m) => m.id !== action.payload),
      };
    default:
      return state;
  }
};

interface TeamContextType {
  currentTeam: Team | null;
  teams: Team[];
  teamMembers: TeamMember[];
  memberDetails: User[];
  isLoading: boolean;
  error: string | null;
  loadUserTeams: () => Promise<void>;
  loadTeamMembers: (teamId: string) => Promise<void>;
  createTeam: (teamData: {
    name: string;
    description?: string;
  }) => Promise<Team>;
  joinTeam: (inviteCode: string) => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  setCurrentTeam: (team: Team | null) => void;
  inviteToTeam: (teamId: string, email: string) => Promise<void>;
  removeFromTeam: (teamId: string, userId: string) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeam = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
};

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(teamReducer, initialState);
  const { user } = useAuth();

  /**
   * Load teams for the current user
   */
  const loadUserTeams = async () => {
    if (!user) return;

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const teams = await database.getUserTeams(user.id);
      dispatch({ type: "SET_TEAMS", payload: teams });

      // Set current team if user has one and no current team is set
      if (teams.length > 0 && !state.currentTeam) {
        const userTeam = teams.find(
          (t) => t.memberIds.includes(user.id) || t.managerId === user.id,
        );
        if (userTeam) {
          dispatch({ type: "SET_CURRENT_TEAM", payload: userTeam });
        }
      }
    } catch (error) {
      console.error("Error loading user teams:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load teams" });
    }
  };

  /**
   * Load members for a specific team
   */
  const loadTeamMembers = async (teamId: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const team = await database.getTeamById(teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      // Create team member objects
      const teamMembers: TeamMember[] = [];
      const memberDetails: User[] = [];

      // Add manager
      const manager = await database.getUserById(team.managerId);
      if (manager) {
        teamMembers.push({
          id: `${teamId}-${manager.id}`,
          userId: manager.id,
          teamId: teamId,
          role: "manager",
          joinedAt: team.createdAt,
          isActive: true,
        });
        memberDetails.push(manager);
      }

      // Add members
      for (const memberId of team.memberIds) {
        const member = await database.getUserById(memberId);
        if (member) {
          teamMembers.push({
            id: `${teamId}-${member.id}`,
            userId: member.id,
            teamId: teamId,
            role: "member",
            joinedAt: member.createdAt,
            isActive: true,
          });
          memberDetails.push(member);
        }
      }

      dispatch({ type: "SET_TEAM_MEMBERS", payload: teamMembers });
      dispatch({ type: "SET_MEMBER_DETAILS", payload: memberDetails });
    } catch (error) {
      console.error("Error loading team members:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load team members" });
    }
  };

  /**
   * Create a new team
   */
  const createTeam = async (teamData: {
    name: string;
    description?: string;
  }): Promise<Team> => {
    if (!user) throw new Error("User not authenticated");

    try {
      const newTeam = await database.createTeam({
        name: teamData.name,
        description: teamData.description,
        managerId: user.id,
        memberIds: [],
        settings: {
          anchorDays: [],
          pulseEnabled: true,
          gamificationEnabled: true,
          allowRemoteWork: true,
          requireCheckIn: false,
        },
      });

      dispatch({ type: "ADD_TEAM", payload: newTeam });
      dispatch({ type: "SET_CURRENT_TEAM", payload: newTeam });

      return newTeam;
    } catch (error) {
      console.error("Error creating team:", error);
      throw new Error("Failed to create team");
    }
  };

  /**
   * Join a team using invite code
   */
  const joinTeam = async (inviteCode: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const response = await teamAPI.joinTeam(inviteCode);
      const team = response.team;

      dispatch({ type: "ADD_TEAM", payload: team });
      dispatch({ type: "SET_CURRENT_TEAM", payload: team });
    } catch (error) {
      console.error("Error joining team:", error);
      throw new Error("Failed to join team");
    }
  };

  /**
   * Update team settings
   */
  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    try {
      const team = await database.getTeamById(teamId);
      if (!team) throw new Error("Team not found");

      const updatedTeam = {
        ...team,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await database.db.set(`team:${teamId}`, JSON.stringify(updatedTeam));
      dispatch({ type: "UPDATE_TEAM", payload: updatedTeam });
    } catch (error) {
      console.error("Error updating team:", error);
      throw new Error("Failed to update team");
    }
  };

  /**
   * Leave a team
   */
  const leaveTeam = async (teamId: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const team = await database.getTeamById(teamId);
      if (!team) throw new Error("Team not found");

      // Remove user from member list
      const updatedMemberIds = team.memberIds.filter((id) => id !== user.id);
      const updatedTeam = {
        ...team,
        memberIds: updatedMemberIds,
        updatedAt: new Date().toISOString(),
      };

      await database.db.set(`team:${teamId}`, JSON.stringify(updatedTeam));
      dispatch({ type: "REMOVE_TEAM", payload: teamId });
    } catch (error) {
      console.error("Error leaving team:", error);
      throw new Error("Failed to leave team");
    }
  };

  /**
   * Set the current active team
   */
  const setCurrentTeam = (team: Team | null) => {
    dispatch({ type: "SET_CURRENT_TEAM", payload: team });
  };

  /**
   * Invite user to team (placeholder - would need email service)
   */
  const inviteToTeam = async (teamId: string, email: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      // This would typically send an email invite
      // For now, we'll just create a placeholder invite record
      const inviteId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const invite = {
        id: inviteId,
        teamId,
        email,
        invitedBy: user.id,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      await database.db.set(`invite:${inviteId}`, JSON.stringify(invite));
      console.log("Invite created (email service not implemented):", invite);
    } catch (error) {
      console.error("Error inviting to team:", error);
      throw new Error("Failed to send team invitation");
    }
  };

  /**
   * Remove user from team
   */
  const removeFromTeam = async (teamId: string, userId: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const team = await database.getTeamById(teamId);
      if (!team) throw new Error("Team not found");

      // Check if current user is team manager
      if (team.managerId !== user.id) {
        throw new Error("Only team managers can remove members");
      }

      // Remove user from member list
      const updatedMemberIds = team.memberIds.filter((id) => id !== userId);
      const updatedTeam = {
        ...team,
        memberIds: updatedMemberIds,
        updatedAt: new Date().toISOString(),
      };

      await database.db.set(`team:${teamId}`, JSON.stringify(updatedTeam));
      dispatch({ type: "UPDATE_TEAM", payload: updatedTeam });

      // Reload team members
      await loadTeamMembers(teamId);
    } catch (error) {
      console.error("Error removing from team:", error);
      throw new Error("Failed to remove team member");
    }
  };

  // Load user teams when user changes
  useEffect(() => {
    if (user) {
      loadUserTeams();
    }
  }, [user]);

  const contextValue: TeamContextType = {
    currentTeam: state.currentTeam,
    teams: state.teams,
    teamMembers: state.teamMembers,
    memberDetails: state.memberDetails,
    isLoading: state.isLoading,
    error: state.error,
    loadUserTeams,
    loadTeamMembers,
    createTeam,
    joinTeam,
    updateTeam,
    leaveTeam,
    setCurrentTeam,
    inviteToTeam,
    removeFromTeam,
  };

  return (
    <TeamContext.Provider value={contextValue}>{children}</TeamContext.Provider>
  );
};

export default TeamProvider;
