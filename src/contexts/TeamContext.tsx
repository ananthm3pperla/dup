import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Team, TeamMember } from '../types';
import { supabase } from '../lib/supabase';
import { validateTeamInvite, joinTeamWithInvite } from '../lib/team';
import { toast } from 'sonner';
import { isDemoMode, DEMO_TEAM, DEMO_TEAM_MEMBERS } from '@/lib/demo';

interface TeamContextType {
  currentTeam: Team | null;
  teams: Team[];
  teamMembers: TeamMember[];
  loading: boolean;
  error: Error | null;
  setCurrentTeam: (team: Team | null) => void;
  loadTeams: () => Promise<void>;
  loadTeamMembers: (teamId: string) => Promise<void>;
  createTeam: (name: string, description?: string, rtoPolicy?: any) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  updateRtoPolicy: (policy: any) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  joinTeam: (inviteCode: string) => Promise<Team>;
  leaveTeam: (teamId: string) => Promise<void>;
  isTeamLeader: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isTeamLeader, setIsTeamLeader] = useState(false);

  // Load teams when user changes
  useEffect(() => {
    if (user) {
      loadTeams();
    } else {
      // Reset state when user logs out
      setTeams([]);
      setCurrentTeam(null);
      setTeamMembers([]);
    }
  }, [user?.id]);

  // Set team leader status when current team changes
  useEffect(() => {
    if (currentTeam && user) {
      setIsTeamLeader(currentTeam.created_by === user.id);
    } else {
      setIsTeamLeader(false);
    }
  }, [currentTeam, user]);

  const loadTeams = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Handle demo mode
      if (isDemoMode()) {
        setTeams([DEMO_TEAM]);
        setCurrentTeam(DEMO_TEAM);
        setTeamMembers(DEMO_TEAM_MEMBERS);
        setLoading(false);
        return;
      }

      // FIX: Use extremely simplified queries to avoid any RLS recursion
      // This ensures we don't trigger complex policy evaluations
      
      // Step 1: Get teams the user created directly (this query is safe)
      const { data: createdTeams, error: createdError } = await supabase
        .from('teams')
        .select('*')
        .eq('created_by', user.id);

      if (createdError) {
        console.error('Error loading created teams:', createdError);
        throw createdError;
      }
      
      // Step 2: Get team memberships directly with the simplest possible query
      const { data: memberships, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error loading user team memberships:', memberError);
        throw memberError;
      }
      
      // If we have memberships, fetch those teams individually
      let memberTeams: Team[] = [];
      if (memberships && memberships.length > 0) {
        const memberTeamIds = memberships.map(m => m.team_id);
        
        // Fetch teams one by one to avoid complex queries
        for (const teamId of memberTeamIds) {
          try {
            const { data: teamData, error: teamError } = await supabase
              .from('teams')
              .select('*')
              .eq('id', teamId)
              .single();
              
            if (!teamError && teamData) {
              memberTeams.push(teamData);
            }
          } catch (err) {
            console.warn(`Error fetching team ${teamId}:`, err);
            // Continue with other teams
          }
        }
      }
      
      // Combine all teams
      const allTeams = [...(createdTeams || []), ...memberTeams];
      
      // Remove duplicates
      const uniqueTeams = Array.from(
        new Map(allTeams.map(team => [team.id, team])).values()
      );
      
      setTeams(uniqueTeams);
      
      // Set first team as current if none selected
      if (!currentTeam && uniqueTeams.length > 0) {
        setCurrentTeam(uniqueTeams[0]);
        await loadTeamMembers(uniqueTeams[0].id);
      }
    } catch (err) {
      console.error('Error loading teams:', err);
      setError(err instanceof Error ? err : new Error('Failed to load teams'));
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Handle demo mode
      if (isDemoMode()) {
        setTeamMembers(DEMO_TEAM_MEMBERS);
        setLoading(false);
        return;
      }

      // FIX: Use direct, simple queries to avoid RLS recursion
      
      // Step 1: Query team members directly using the teamId
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('id, team_id, user_id, role, joined_at')
        .eq('team_id', teamId);

      if (membersError) {
        console.error('Error loading team members:', membersError);
        throw membersError;
      }
      
      // If no members found, set empty array and return
      if (!members || members.length === 0) {
        setTeamMembers([]);
        return;
      }
      
      // Step 2: Get user details for these team members in a separate query
      const userIds = members.map(m => m.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error loading user profiles:', profilesError);
        // Continue anyway with partial data
      }
      
      // Combine the data
      const enhancedMembers = members.map(member => {
        const profile = profiles?.find(p => p.user_id === member.user_id);
        return {
          ...member,
          user: profile ? {
            id: profile.user_id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
          } : {
            id: member.user_id,
            full_name: 'Team Member',
            avatar_url: null
          }
        };
      });
      
      setTeamMembers(enhancedMembers);
    } catch (err) {
      console.error('Error loading team members:', err);
      setError(err instanceof Error ? err : new Error('Failed to load team members'));
      
      // Fallback to empty state rather than completely failing
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string, description?: string, rtoPolicy?: any): Promise<Team> => {
    if (!user) throw new Error('Must be logged in to create a team');

    setLoading(true);
    setError(null);
    try {
      // Generate a random 8-character invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
          description,
          created_by: user.id,
          invite_code: inviteCode,
          rto_policy: rtoPolicy || {
            required_days: 3,
            core_hours: {
              start: '10:00',
              end: '16:00'
            },
            allowed_work_types: ['office', 'remote', 'flexible']
          }
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'leader'
        });

      if (memberError) throw memberError;

      // Create default reward policy
      const { error: policyError } = await supabase
        .from('reward_policies')
        .insert({
          team_id: team.id,
          accrual_model: 'ratio_based',
          office_to_remote_ratio: 3,
          streak_bonus_threshold: 5,
          streak_bonus_amount: 1
        });
        
      if (policyError) {
        console.warn('Error creating reward policy:', policyError);
        // Don't fail team creation due to this
      }

      // Update local state
      setTeams(prev => [...prev, team]);
      setCurrentTeam(team);

      return team;
    } catch (err) {
      console.error('Error creating team:', err);
      throw err instanceof Error ? err : new Error('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    if (!isTeamLeader) throw new Error('Only team leaders can update team settings');
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId);

      if (error) throw error;

      // Update local state
      setTeams(prev => prev.map(team => 
        team.id === teamId ? { ...team, ...updates } : team
      ));
      if (currentTeam?.id === teamId) {
        setCurrentTeam(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      console.error('Error updating team:', err);
      setError(err instanceof Error ? err : new Error('Failed to update team'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRtoPolicy = async (policy: any) => {
    if (!currentTeam) throw new Error('No team selected');
    if (!isTeamLeader) throw new Error('Only team leaders can update RTO policy');
    
    const updates = {
      rto_policy: {
        ...currentTeam.rto_policy,
        ...policy
      }
    };
    
    return updateTeam(currentTeam.id, updates);
  };

  const deleteTeam = async (teamId: string) => {
    if (!isTeamLeader) throw new Error('Only team leaders can delete teams');
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      // Update local state
      setTeams(prev => prev.filter(team => team.id !== teamId));
      if (currentTeam?.id === teamId) {
        setCurrentTeam(null);
      }
    } catch (err) {
      console.error('Error deleting team:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete team'));
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (inviteCode: string): Promise<Team> => {
    if (!user) throw new Error('Must be logged in to join a team');

    setLoading(true);
    setError(null);
    try {
      // Handle demo mode
      if (isDemoMode()) {
        // In demo mode, just return the demo team
        setTeams([DEMO_TEAM]);
        setCurrentTeam(DEMO_TEAM);
        setTeamMembers(DEMO_TEAM_MEMBERS);
        return DEMO_TEAM;
      }

      // First validate the invite code
      const validation = await validateTeamInvite(inviteCode);
      
      if (!validation.valid || !validation.team) {
        throw new Error(validation.message || 'Invalid invite code');
      }
      
      // Join the team
      const result = await joinTeamWithInvite(user.id, inviteCode);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Get the full team data
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', validation.team.id)
        .single();
      
      if (teamError) throw teamError;
      
      // Update local state
      await loadTeams();
      setCurrentTeam(team);

      toast.success(`You've joined ${team.name}`);
      
      return team;
    } catch (err) {
      console.error('Error joining team:', err);
      setError(err instanceof Error ? err : new Error('Failed to join team'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const leaveTeam = async (teamId: string) => {
    if (!user) throw new Error('Must be logged in to leave a team');
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setTeams(prev => prev.filter(team => team.id !== teamId));
      if (currentTeam?.id === teamId) {
        setCurrentTeam(null);
      }
    } catch (err) {
      console.error('Error leaving team:', err);
      setError(err instanceof Error ? err : new Error('Failed to leave team'));
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentTeam,
    teams,
    teamMembers,
    loading,
    error,
    setCurrentTeam,
    loadTeams,
    loadTeamMembers,
    createTeam,
    updateTeam,
    updateRtoPolicy,
    deleteTeam,
    joinTeam,
    leaveTeam,
    isTeamLeader
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