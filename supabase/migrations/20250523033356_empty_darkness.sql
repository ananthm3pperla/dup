/*
  # Fix RLS recursion in team policies

  1. New Functions
    - `get_user_team_memberships`: Helper function to get team memberships for a user without triggering RLS recursion
    - `get_team_members`: Helper function to get members of a team without triggering RLS recursion

  2. Updates
    - Safer functions that avoid the recursive lookups in RLS policies
*/

-- Function to get team memberships for a user
CREATE OR REPLACE FUNCTION get_user_team_memberships(user_id_param UUID)
RETURNS TABLE (
  team_id UUID,
  user_id UUID,
  role TEXT,
  team_data JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.team_id,
    tm.user_id,
    tm.role,
    jsonb_build_object(
      'id', t.id,
      'name', t.name,
      'description', t.description,
      'created_by', t.created_by,
      'invite_code', t.invite_code,
      'rto_policy', t.rto_policy,
      'created_at', t.created_at,
      'updated_at', t.updated_at
    ) AS team_data
  FROM 
    team_members tm
  JOIN 
    teams t ON tm.team_id = t.id
  WHERE 
    tm.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get team members with their profiles
CREATE OR REPLACE FUNCTION get_team_members(team_id_param UUID)
RETURNS TABLE (
  id UUID,
  team_id UUID,
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ,
  user JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.role,
    tm.joined_at,
    jsonb_build_object(
      'id', p.user_id,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url
    ) AS user
  FROM 
    team_members tm
  LEFT JOIN 
    profiles p ON tm.user_id = p.user_id
  WHERE 
    tm.team_id = team_id_param;
END;
$$ LANGUAGE plpgsql;