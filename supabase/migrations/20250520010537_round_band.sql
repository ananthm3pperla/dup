-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;

-- Create a fixed version of the team_members policy
CREATE POLICY "Users can view team members of their teams" ON public.team_members
    FOR SELECT
    TO authenticated
    USING (
      user_id = auth.uid() OR  -- User can see their own memberships
      EXISTS (  -- User can see members of teams they belong to
        SELECT 1 FROM team_members
        WHERE 
          team_members.team_id = team_id AND  -- Same team as the record being accessed
          team_members.user_id = auth.uid()   -- Current user is a member
      )
    );

-- Create a fixed version of the teams policy
CREATE POLICY "Team members can view their teams" ON public.teams
    FOR SELECT
    TO authenticated
    USING (
      created_by = auth.uid() OR  -- User created the team
      EXISTS (  -- User is a member of the team
        SELECT 1 FROM team_members
        WHERE 
          team_members.team_id = id AND  -- ID of the team being accessed
          team_members.user_id = auth.uid()  -- Current user is a member
      )
    );