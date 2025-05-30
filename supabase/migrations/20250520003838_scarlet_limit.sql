/*
  # Fix infinite recursion in team_members policy

  1. Changes
    - Drop the existing "Users can view team members of their teams" policy which contains a self-referencing condition
    - Create a new corrected policy that properly compares team IDs without causing recursion
  
  2. Security
    - Maintains the same security intent but fixes the implementation
    - Ensures users can only view team members of teams they belong to
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;

-- Create a corrected policy
CREATE POLICY "Users can view team members of their teams"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM team_members AS tm
    WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()
  )
);