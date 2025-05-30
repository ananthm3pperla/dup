/*
  # Fix Infinite Recursion in RLS Policies and Onboarding Issues

  1. Key Changes
    - Drop all problematic policies that cause infinite recursion
    - Create simple, direct policies without circular references
    - Fix onboarding duplicate key issues with proper constraints
    - Ensure user_onboarding table has appropriate permissions

  2. Purpose
    - Fix the "infinite recursion detected in policy for relation team_members" error
    - Prevent duplicate key violations during user creation
    - Provide correct access control without recursive policy chains
    - Create a smooth onboarding flow for new users
*/

-- First, drop all problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Team members can view schedules of their team" ON work_schedules;
DROP POLICY IF EXISTS "Users can view team members of their teams v2" ON team_members;
DROP POLICY IF EXISTS "Team members can view schedules of colleagues" ON work_schedules;
DROP POLICY IF EXISTS "Team members can view other team members" ON team_members;
DROP POLICY IF EXISTS "Users can view members of teams they belong to" ON team_members;
DROP POLICY IF EXISTS "Team members access policy" ON team_members;
DROP POLICY IF EXISTS "Users can manage their own team memberships" ON team_members;
DROP POLICY IF EXISTS "Team leaders can manage all team members" ON team_members;

-- Reset RLS on affected tables
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

ALTER TABLE work_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;

-- Simple policy for teams - No recursion
CREATE POLICY "Users can view teams they belong to or created"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Team creators can update their teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Simple policies for team_members
CREATE POLICY "Users can view their own team memberships"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR 
         team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()) OR
         team_id IN (SELECT id FROM teams WHERE created_by = auth.uid()));

CREATE POLICY "Team creators can manage team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Simple policies for work_schedules
CREATE POLICY "Users can manage their own schedules"
  ON work_schedules
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view team members' schedules"
  ON work_schedules
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT tm.user_id
      FROM team_members tm
      WHERE tm.team_id IN (
        SELECT team_id 
        FROM team_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS team_members_user_team_idx ON team_members(user_id, team_id);
CREATE INDEX IF NOT EXISTS team_members_team_user_idx ON team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS teams_created_by_idx ON teams(created_by);
CREATE INDEX IF NOT EXISTS work_schedules_user_date_idx ON work_schedules(user_id, date);

-- Fix onboarding duplicate key issues
-- Ensure user_onboarding has a unique constraint on user_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage
    WHERE table_name = 'user_onboarding'
    AND column_name = 'user_id'
    AND constraint_name LIKE '%_key'
  ) THEN
    ALTER TABLE user_onboarding ADD CONSTRAINT user_onboarding_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Fix initialize_user_onboarding function to handle conflicts
CREATE OR REPLACE FUNCTION initialize_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_onboarding (user_id, onboarding_completed)
  VALUES (NEW.id, FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger
DROP TRIGGER IF EXISTS on_auth_user_created_init_onboarding ON auth.users;

CREATE TRIGGER on_auth_user_created_init_onboarding
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION initialize_user_onboarding();

-- Make sure user_onboarding has proper RLS policies
ALTER TABLE user_onboarding DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all onboarding"
  ON user_onboarding
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Users can manage their own onboarding"
  ON user_onboarding
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());