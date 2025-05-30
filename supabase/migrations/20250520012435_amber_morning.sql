-- This migration fixes the recursive RLS policy issues on team-related tables

-- First, drop all the problematic policies
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view schedules of their team" ON public.work_schedules;

-- Create teams policy that avoids recursion
CREATE POLICY "Team members can view their teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  -- Allow team creators to view their own teams
  created_by = auth.uid() 
  OR
  -- Allow direct team member access without joins
  EXISTS (
    SELECT 1
    FROM team_members
    WHERE team_members.team_id = id
    AND team_members.user_id = auth.uid()
  )
);

-- Create team_members policy that avoids recursion
CREATE POLICY "Users can view team members of their teams"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  -- Allow users to see their own team memberships
  user_id = auth.uid()
  OR
  -- Allow team leaders to see their team members
  EXISTS (
    SELECT 1 
    FROM teams
    WHERE teams.id = team_id
    AND teams.created_by = auth.uid()
  )
  OR
  -- Allow team members to see other members in their teams
  EXISTS (
    SELECT 1 
    FROM team_members my_memberships
    WHERE my_memberships.team_id = team_id
    AND my_memberships.user_id = auth.uid()
  )
);

-- Create work_schedules policy that avoids recursion
CREATE POLICY "Team members can view schedules of their team"
ON public.work_schedules
FOR SELECT
TO authenticated
USING (
  -- Allow users to see their own schedules
  user_id = auth.uid()
  OR
  -- Team members can see schedules of teammates
  EXISTS (
    SELECT 1
    FROM team_members my_team
    WHERE my_team.user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM team_members teammate
      WHERE teammate.team_id = my_team.team_id
      AND teammate.user_id = work_schedules.user_id
    )
  )
);

-- Create RLS policies for user_onboarding to fix insert errors
DROP POLICY IF EXISTS "Users can insert their onboarding" ON user_onboarding;
DROP POLICY IF EXISTS "Users can manage their own onboarding" ON user_onboarding;
DROP POLICY IF EXISTS "Service role can manage all onboarding" ON user_onboarding;

-- Service role policy
CREATE POLICY "Service role can manage all onboarding" 
ON user_onboarding
FOR ALL 
TO service_role
USING (true);

-- User management policy
CREATE POLICY "Users can manage their own onboarding" 
ON user_onboarding
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS team_members_team_user_idx ON team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS work_schedules_user_date_idx ON work_schedules(user_id, date);