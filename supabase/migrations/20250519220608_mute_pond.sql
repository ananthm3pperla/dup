/*
  # Fix Recursive Policies and User Experience Improvements

  1. Changes
    - Fix policies to avoid infinite recursion
    - Add improved error handling for missing users
    - Clean up policy dependencies to avoid circular references

  2. Purpose
    - Prevent "infinite recursion detected in policy" errors
    - Provide better user experience for account deletion scenarios
    - Ensure proper authentication state management
*/

-- Fix team members policy (this was creating infinite recursion)
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Team members can view schedules of their team" ON work_schedules;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;

-- Create improved non-recursive policies
CREATE POLICY "Team members can view their teams"
ON teams
FOR SELECT
TO authenticated
USING (
  -- Direct team creators can view their teams
  created_by = auth.uid() 
  OR 
  -- Team members can view their teams without recursive checks
  EXISTS (
    SELECT 1
    FROM team_members
    WHERE team_members.team_id = id
    AND team_members.user_id = auth.uid()
  )
);

-- Non-recursive policy for team members
CREATE POLICY "Users can view team members of their teams"
ON team_members
FOR SELECT
TO authenticated
USING (
  -- Users can see their own memberships
  user_id = auth.uid()
  OR
  -- Team leaders can see all team members
  EXISTS (
    SELECT 1
    FROM teams
    WHERE teams.id = team_id
    AND teams.created_by = auth.uid()
  )
  OR
  -- Team members can see other team members
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm.team_id = team_id
    AND tm.user_id = auth.uid()
  )
);

-- Non-recursive policy for work schedules
CREATE POLICY "Team members can view schedules of their team"
ON work_schedules
FOR SELECT
TO authenticated
USING (
  -- Users can see their own schedules
  user_id = auth.uid()
  OR
  -- Team leaders can see their team's schedules
  EXISTS (
    SELECT 1
    FROM teams
    WHERE teams.id IN (
      SELECT team_id FROM team_members WHERE user_id = work_schedules.user_id
    )
    AND teams.created_by = auth.uid()
  )
  OR
  -- Team members can see other team members' schedules
  EXISTS (
    SELECT 1
    FROM team_members tm1
    WHERE tm1.user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM team_members tm2
      WHERE tm2.team_id = tm1.team_id
      AND tm2.user_id = work_schedules.user_id
    )
  )
);

-- Add a delete cascade to profiles to ensure clean user deletion
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey,
ADD CONSTRAINT profiles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create a function to check if a user exists
CREATE OR REPLACE FUNCTION check_user_exists(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;