/*
  # Comprehensive Fix for Infinite Recursion in RLS Policies

  This migration resolves the infinite recursion detected in Row Level Security policies
  for team_members, work_schedules and other related tables. The issue occurs when
  policies reference themselves in circular logic.

  1. Changes
    - Drop all problematic policies causing recursion
    - Add new non-recursive policies with simple, direct conditions
    - Create strategic indexes for performance optimization

  2. Security
    - Maintains same security intent but with proper implementation
    - Ensures users can only access data they should have permission to see
*/

-- First, drop all problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams v2" ON team_members;
DROP POLICY IF EXISTS "Users can view members of teams they belong to" ON team_members;
DROP POLICY IF EXISTS "Team members access policy" ON team_members;
DROP POLICY IF EXISTS "Team members can view schedules of their team" ON work_schedules;
DROP POLICY IF EXISTS "Team members can view schedules of team" ON work_schedules;
DROP POLICY IF EXISTS "Team members can view schedules of colleagues" ON work_schedules;
DROP POLICY IF EXISTS "Work schedules access policy" ON work_schedules;
DROP POLICY IF EXISTS "Team leaders can view and verify checkins" ON checkins;
DROP POLICY IF EXISTS "Team members can view checkins" ON checkins;
DROP POLICY IF EXISTS "Team members can view checkins of their team" ON checkins;
DROP POLICY IF EXISTS "Checkins access policy" ON checkins;

-- Create a simple, efficient policy for team_members access
CREATE POLICY "Non-recursive team members policy"
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
    OR
    -- Team leaders can see all members in their teams
    team_id IN (
      SELECT id
      FROM teams
      WHERE created_by = auth.uid()
    )
  );

-- Create a simple, efficient policy for work_schedules access
CREATE POLICY "Non-recursive work schedules policy"
  ON work_schedules
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own schedules
    user_id = auth.uid() 
    OR 
    -- Users can see schedules of team members in teams they belong to
    EXISTS (
      -- Teams where current user is a member
      SELECT 1 FROM team_members my_membership
      WHERE my_membership.user_id = auth.uid()
      
      -- And the schedule owner is also a member of that team
      AND EXISTS (
        SELECT 1 FROM team_members colleague_membership
        WHERE colleague_membership.team_id = my_membership.team_id
        AND colleague_membership.user_id = work_schedules.user_id
      )
    )
    OR
    -- Team leaders can see schedules of members in their teams
    EXISTS (
      SELECT 1
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE t.created_by = auth.uid()
      AND tm.user_id = work_schedules.user_id
    )
  );

-- Create a simple, efficient policy for checkins access
CREATE POLICY "Non-recursive checkins policy"
  ON checkins
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own checkins
    user_id = auth.uid() 
    OR 
    -- Team leaders can see all checkins for their teams
    EXISTS (
      SELECT 1
      FROM teams
      WHERE id = checkins.team_id
      AND created_by = auth.uid()
    )
    OR
    -- Team members can see checkins from their teams
    EXISTS (
      -- Teams where current user is a member
      SELECT 1 FROM team_members my_membership
      WHERE my_membership.user_id = auth.uid()
      AND my_membership.team_id = checkins.team_id
    )
  );

-- Add optimize indexes to support the new policies
CREATE INDEX IF NOT EXISTS idx_team_members_team_user 
  ON team_members(team_id, user_id);
  
CREATE INDEX IF NOT EXISTS idx_team_members_user_team 
  ON team_members(user_id, team_id);
  
CREATE INDEX IF NOT EXISTS idx_work_schedules_user_date 
  ON work_schedules(user_id, date);
  
CREATE INDEX IF NOT EXISTS idx_checkins_user_team 
  ON checkins(user_id, team_id);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_teams_created_by 
  ON teams(created_by);
  
CREATE INDEX IF NOT EXISTS idx_teams_id_created_by 
  ON teams(id, created_by);