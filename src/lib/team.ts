import { supabase } from './supabase';

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
    // FIX: Use a simplified query to avoid RLS recursion
    // Direct database query that doesn't trigger complex RLS evaluations
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, description')
      .eq('invite_code', inviteCode)
      .single();
    
    if (error) {
      console.error('Error validating team invite:', error);
      return { valid: false, message: 'Invalid invite code' };
    }
    
    return { valid: true, team: data };
  } catch (error) {
    console.error('Error validating team invite:', error);
    return { valid: false, message: 'Failed to validate invite code' };
  }
}

// Join a team with an invite code
export async function joinTeamWithInvite(userId: string, inviteCode: string): Promise<{
  success: boolean;
  team?: {
    id: string;
    name: string;
  };
  message: string;
}> {
  try {
    // FIX: Use a simplified approach with explicit, separate queries
    
    // Step 1: Get team by invite code (simple query)
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('invite_code', inviteCode)
      .single();
    
    if (teamError || !team) {
      return { success: false, message: 'Invalid invite code' };
    }
    
    // Step 2: Check if user is already a member (direct query)
    const { data: existingMember, error: memberError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (memberError) {
      console.error('Error checking team membership:', memberError);
      return { success: false, message: 'Error checking team membership' };
    }
    
    if (existingMember) {
      return { 
        success: true, 
        team, 
        message: 'You are already a member of this team' 
      };
    }
    
    // Step 3: Add user to team (direct insert)
    const { error: joinError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'member',
      });
    
    if (joinError) {
      console.error('Error joining team:', joinError);
      return { success: false, message: 'Failed to join team' };
    }
    
    return { 
      success: true, 
      team,
      message: 'Successfully joined team' 
    };
  } catch (err) {
    console.error('Error joining team with invite:', err);
    return { 
      success: false, 
      message: err instanceof Error ? err.message : 'Failed to join team' 
    };
  }
}