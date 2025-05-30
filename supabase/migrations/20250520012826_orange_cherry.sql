/*
  # Fix Infinite Recursion in Team Members Policies

  1. Changes
    - Drop problematic policies on team_members, work_schedules, and checkins tables
    - Replace them with non-recursive alternatives that avoid infinite recursion

  2. Problem
    - The original policies contained self-references or circular dependencies
    - This caused PostgreSQL to enter infinite recursion when evaluating RLS conditions
    - Error: "infinite recursion detected in policy for relation team_members"

  3. Solution
    - Rewrite policies to eliminate circular references
    - Use simpler conditions that achieve the same security goals
    - Ensure proper index usage for performance
*/

-- First drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team members can view schedules of their team" ON work_schedules;
DROP POLICY IF EXISTS "Team members can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team members can view schedules of team" ON work_schedules;
DROP POLICY IF EXISTS "Team leaders can view and verify checkins" ON checkins;
DROP POLICY IF EXISTS "Team members can view checkins" ON checkins;

-- Add improved policy for team members that avoids recursion
CREATE POLICY "Users can view teams they belong to"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    -- Simple condition: either the user is a member of this team
    -- or the user created the team (is the team leader)
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1
      FROM teams
      WHERE id = team_id AND created_by = auth.uid()
    )
  );

-- Add improved policy for work schedules that avoids recursion
CREATE POLICY "Team members can view schedules of colleagues"
  ON work_schedules
  FOR SELECT
  TO authenticated
  USING (
    -- Users can view their own schedules
    user_id = auth.uid() OR
    -- Or schedules of users who belong to the same team
    EXISTS (
      SELECT 1
      FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid() -- current user's membership
      AND tm2.user_id = work_schedules.user_id -- target schedule's user
    )
  );

-- Add improved policy for checkins
CREATE POLICY "Team members can view checkins of their team"
  ON checkins
  FOR SELECT
  TO authenticated
  USING (
    -- Users can view their own checkins
    user_id = auth.uid() OR
    -- Or checkins from users in teams they're members of
    EXISTS (
      SELECT 1
      FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid() -- current user's membership
      AND tm2.user_id = checkins.user_id -- target checkin's user
    ) OR
    -- Or if they're the team leader
    EXISTS (
      SELECT 1
      FROM teams
      WHERE id = team_id AND created_by = auth.uid()
    )
  );

-- Create indexes to optimize the policies
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id_team_id ON team_members(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_user_id ON work_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id_team_id ON checkins(user_id, team_id);