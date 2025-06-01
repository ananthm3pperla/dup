import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { teamService, Team, TeamMember } from '@/lib/team';
import { useAuth } from './AuthContext';

interface TeamContextType {
  team: Team | null;
  members: TeamMember[];
  leaderboard: TeamMember[];
  isTeamLeader: boolean;
  loading: boolean;
  createTeam: (name: string, description: string, requiredDays: number, anchorDays?: string[]) => Promise<void>;
  joinTeam: (inviteCode: string) => Promise<void>;
  refreshTeam: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const isTeamLeader = user?.role === 'manager' || user?.role === 'hr';

  const refreshTeam = async () => {
    if (!user) return;

    try {
      const teamData = await teamService.getMyTeam();
      setTeam(teamData);

      if (teamData && isTeamLeader) {
        const analytics = await teamService.getTeamAnalytics();
        setMembers(analytics.members);
      }
    } catch (error) {
      console.error('Failed to refresh team:', error);
    }
  };

  const refreshLeaderboard = async () => {
    if (!user) return;

    try {
      const leaderboardData = await teamService.getLeaderboard();
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error);
    }
  };

  useEffect(() => {
    if (user) {
      refreshTeam().then(() => {
        refreshLeaderboard().finally(() => setLoading(false));
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const createTeam = async (name: string, description: string, requiredDays: number, anchorDays: string[] = []) => {
    const newTeam = await teamService.createTeam(name, description, requiredDays, anchorDays);
    setTeam(newTeam);
    await refreshLeaderboard();
  };

  const joinTeam = async (inviteCode: string) => {
    const joinedTeam = await teamService.joinTeam(inviteCode);
    setTeam(joinedTeam);
    await refreshLeaderboard();
  };

  const value = {
    team,
    members,
    leaderboard,
    isTeamLeader,
    loading,
    createTeam,
    joinTeam,
    refreshTeam,
    refreshLeaderboard,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}