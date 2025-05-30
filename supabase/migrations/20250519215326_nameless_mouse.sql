/*
  # Fix infinite recursion in team_members policy

  1. Changes
    - Drop and recreate the policy that's causing infinite recursion
    - Fix team members view policy to avoid self-referential loops

  2. Purpose
    - Fix the "infinite recursion detected in policy for relation team_members" error
    - Ensure proper access control without recursion issues
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Team members can view schedules of their team" ON work_schedules;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;

-- Create a corrected policy for team members
CREATE POLICY "Users can view team members of their teams"
ON team_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm.team_id = team_id
    AND tm.user_id = auth.uid()
  )
);

-- Create a corrected policy for work schedules
CREATE POLICY "Team members can view schedules of their team"
ON work_schedules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm.user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM team_members tm2
      WHERE tm2.team_id = tm.team_id
      AND tm2.user_id = work_schedules.user_id
    )
  )
);

-- Create a corrected policy for team votes
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
CREATE POLICY "Team members can view their teams"
ON teams
FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1
    FROM team_members
    WHERE team_members.team_id = id
    AND team_members.user_id = auth.uid()
  )
);