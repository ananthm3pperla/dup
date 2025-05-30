/*
  # Fix infinite recursion in team_members policy

  1. Changes
     - Fix the SELECT policy on teams table that has a self-referencing condition causing infinite recursion
     - The policy is comparing team_members.team_id to team_members.id incorrectly
     - Updated to compare team_members.team_id to teams.id, which is the correct relation
  
  2. Security
     - Maintains the same security intent: team members can view their teams
     - Prevents the infinite recursion that was causing 500 errors
*/

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;

-- Then recreate it with the correct condition
CREATE POLICY "Team members can view their teams"
  ON public.teams
  FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1
      FROM team_members
      WHERE team_members.team_id = teams.id AND team_members.user_id = auth.uid()
    )) OR (created_by = auth.uid())
  );