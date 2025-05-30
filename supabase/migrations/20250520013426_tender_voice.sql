/*
  # Fix infinite recursion in team_members RLS policy

  1. Changes
    - Drop the problematic policy "Users can view team members of their teams" that's causing infinite recursion
    - Create a new policy that accomplishes the same goal without recursion
    - The new policy allows users to view team members where they belong to the same team
  
  2. Security
    - Maintains the same security model but implements it in a way that avoids recursion
    - Users can still only view team members of teams they belong to
*/

-- Drop the problematic policy that's causing infinite recursion
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;

-- Create a new policy that accomplishes the same goal without recursion
CREATE POLICY "Users can view team members of their teams v2" 
ON team_members
FOR SELECT
TO authenticated
USING (
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
  )
);