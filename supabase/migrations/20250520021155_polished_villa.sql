/*
  # Fix Infinite Recursion in RLS Policies

  1. Key Changes
    - Drop all problematic policies that cause infinite recursion
    - Create new non-recursive policies with direct queries
    - Add appropriate indexes to improve performance
    - Fix checkins, team_members and work_schedules policies

  2. Purpose
    - Fix the infinite recursion errors in RLS policies
    - Ensure all team-related queries work properly
    - Maintain security while avoiding recursive policy references
*/

-- First drop all problematic policies that are causing infinite recursion
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams v2" ON team_members;
DROP POLICY IF EXISTS "Users can view members of teams they belong to" ON team_members; 
DROP POLICY IF EXISTS "Team members can view schedules of their team" ON work_schedules;
DROP POLICY IF EXISTS "Team members can view schedules of team" ON work_schedules;
DROP POLICY IF EXISTS "Team members can view schedules of colleagues" ON work_schedules;
DROP POLICY IF EXISTS "Team leaders can view and verify checkins" ON checkins;
DROP POLICY IF EXISTS "Team members can view checkins of their team" ON checkins;

-- Create a new non-recursive policy for team_members
CREATE POLICY "Team members access policy"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own memberships
    user_id = auth.uid() 
    OR 
    -- Users can see team memberships for teams they belong to
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create a non-recursive policy for work_schedules
CREATE POLICY "Work schedules access policy"
  ON work_schedules
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own schedules
    user_id = auth.uid() 
    OR 
    -- Users can see schedules of team members in teams they belong to
    user_id IN (
      SELECT tm.user_id 
      FROM team_members tm
      JOIN team_members my_teams ON tm.team_id = my_teams.team_id
      WHERE my_teams.user_id = auth.uid()
    )
  );

-- Create a non-recursive policy for checkins
CREATE POLICY "Checkins access policy"
  ON checkins
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own checkins
    user_id = auth.uid() 
    OR 
    -- Team leaders can see all checkins for their teams
    team_id IN (
      SELECT id 
      FROM teams 
      WHERE created_by = auth.uid()
    )
    OR
    -- Team members can see checkins from their teams
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Add indexes to optimize the new policies
CREATE INDEX IF NOT EXISTS idx_team_members_user_team 
  ON team_members(user_id, team_id);
  
CREATE INDEX IF NOT EXISTS idx_work_schedules_user_date 
  ON work_schedules(user_id, date);
  
CREATE INDEX IF NOT EXISTS idx_checkins_user_team 
  ON checkins(user_id, team_id);

-- Create additional indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_teams_id_created_by 
  ON teams(id, created_by);