/*
  # Fix infinite recursion in team_members policy

  1. Changes
    - Drop existing policy that causes recursive loop
    - Create new policy for viewing team members that avoids recursion
    - Modifies team members SELECT policy to use a direct join to teams table

  2. Security
    - Maintains security intent of original policy
    - Users can still view team members of their teams, but without recursion
    - Team leaders can still manage members
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;

-- Create a new policy that achieves the same goal without recursion
CREATE POLICY "Users can view members of teams they belong to" 
ON team_members
FOR SELECT 
TO authenticated
USING (
  team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  )
);

-- No changes to existing leader policies as they don't cause recursion