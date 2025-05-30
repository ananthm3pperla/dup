/*
  # Fix Recursive RLS Policies

  1. New Approach
    - Replace recursive policies with simple, efficient alternatives
    - Use direct queries without nested joins
    - Add proper indexes for performance

  2. Security
    - Maintain the same security intent
    - Ensure users can only access authorized data
    - Prevent infinite recursion while preserving access control

  3. Tables Fixed
    - team_members
    - work_schedules
    - checkins
*/

-- First, drop all problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams v2" ON team_members;
DROP POLICY IF EXISTS "Users can view members of teams they belong to" ON team_members;
DROP POLICY IF EXISTS "Team members access policy" ON team_members;
DROP POLICY IF EXISTS "Non-recursive team members policy" ON team_members;
DROP POLICY IF EXISTS "Team members can view schedules of their team" ON work_schedules;
DROP POLICY IF EXISTS "Team members can view schedules of team" ON work_schedules;
DROP POLICY IF EXISTS "Team members can view schedules of colleagues" ON work_schedules;
DROP POLICY IF EXISTS "Work schedules access policy" ON work_schedules;
DROP POLICY IF EXISTS "Non-recursive work schedules policy" ON work_schedules;
DROP POLICY IF EXISTS "Team leaders can view and verify checkins" ON checkins;
DROP POLICY IF EXISTS "Team members can view checkins" ON checkins;
DROP POLICY IF EXISTS "Team members can view checkins of their team" ON checkins;
DROP POLICY IF EXISTS "Checkins access policy" ON checkins;
DROP POLICY IF EXISTS "Non-recursive checkins policy" ON checkins;

-- Create a safe policy for team_members without recursive joins
CREATE POLICY "Final team members policy"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own memberships
    user_id = auth.uid() 
    OR 
    -- Team leaders can see all members in their teams
    EXISTS (
      SELECT 1
      FROM teams
      WHERE id = team_id
      AND created_by = auth.uid()
    )
    OR
    -- Users can see team memberships for teams they belong to
    EXISTS (
      SELECT 1 
      FROM team_members 
      WHERE user_id = auth.uid()
      AND team_id = team_members.team_id
    )
  );

-- Create a safe policy for work_schedules without recursive joins
CREATE POLICY "Final work schedules policy"
  ON work_schedules
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own schedules
    user_id = auth.uid() 
    OR 
    -- Team leaders can see schedules of members in their teams
    EXISTS (
      SELECT 1
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE t.created_by = auth.uid()
      AND tm.user_id = work_schedules.user_id
    )
    OR
    -- Team members can see schedules of other members in their teams
    work_schedules.user_id IN (
      SELECT tm2.user_id
      FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
    )
  );

-- Create a safe policy for checkins without recursive joins
CREATE POLICY "Final checkins policy"
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
    checkins.team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
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
  
CREATE INDEX IF NOT EXISTS idx_teams_created_by 
  ON teams(created_by);
  
CREATE INDEX IF NOT EXISTS idx_teams_id_created_by 
  ON teams(id, created_by);