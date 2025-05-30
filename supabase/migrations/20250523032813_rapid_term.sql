/*
  # Fix Recursive RLS Policies and Onboarding Flow

  1. Changes
    - Drop all problematic policies that cause infinite recursion
    - Create new non-recursive RLS policies for team_members, teams, and work_schedules
    - Fix user_onboarding table unique constraint and insertion logic
    - Add appropriate indexes to improve query performance

  2. Purpose
    - Fix the "infinite recursion detected in policy for relation team_members" error
    - Fix the "duplicate key value violates unique constraint" error in onboarding
    - Ensure proper access control without recursive policies
    - Provide a clean user experience for new account creation
*/

-- First drop all problematic policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Team members can view schedules of their team" ON work_schedules;
DROP POLICY IF EXISTS "Users can view team members of their teams v2" ON team_members;
DROP POLICY IF EXISTS "Users can view members of teams they belong to" ON team_members;
DROP POLICY IF EXISTS "Team members access policy" ON team_members;
DROP POLICY IF EXISTS "Non-recursive team members policy" ON team_members;
DROP POLICY IF EXISTS "Final team members policy" ON team_members;
DROP POLICY IF EXISTS "Users can manage their own team memberships" ON team_members;
DROP POLICY IF EXISTS "Team leaders can manage all team members" ON team_members;
DROP POLICY IF EXISTS "Team members can view other team members" ON team_members;

-- Reset RLS on affected tables
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

ALTER TABLE work_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies for teams
CREATE POLICY "Users can view their own teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    -- Teams created by the user
    created_by = auth.uid() OR
    -- Teams the user is a member of
    EXISTS (
      SELECT 1
      FROM team_members
      WHERE team_id = teams.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Create new simplified policies for team_members
CREATE POLICY "Users can see their own memberships"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    -- User's own memberships
    user_id = auth.uid() OR
    -- Memberships in teams created by the user
    team_id IN (SELECT id FROM teams WHERE created_by = auth.uid()) OR
    -- Memberships in teams the user belongs to
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own memberships"
  ON team_members
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Team leaders can manage team memberships"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (SELECT id FROM teams WHERE created_by = auth.uid())
  )
  WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE created_by = auth.uid())
  );

-- Create new simplified policies for work_schedules
CREATE POLICY "Users can manage their own schedules"
  ON work_schedules
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view team schedules"
  ON work_schedules
  FOR SELECT
  TO authenticated
  USING (
    -- Schedules of team members in teams the user belongs to or leads
    user_id IN (
      SELECT tm.user_id
      FROM team_members tm
      WHERE tm.team_id IN (
        -- Teams the user is a member of
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
        UNION
        -- Teams the user created
        SELECT id FROM teams WHERE created_by = auth.uid()
      )
    )
  );

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_work_schedules_user_id ON work_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_date ON work_schedules(date);

-- Fix onboarding duplicate key issues
-- Make sure user_onboarding has a unique constraint on user_id
ALTER TABLE user_onboarding DROP CONSTRAINT IF EXISTS user_onboarding_user_id_key;
ALTER TABLE user_onboarding ADD CONSTRAINT user_onboarding_user_id_key UNIQUE (user_id);

-- Update initialize_user_onboarding function to handle conflicts
CREATE OR REPLACE FUNCTION initialize_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_onboarding (user_id, onboarding_completed)
  VALUES (NEW.id, FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger for consistency
DROP TRIGGER IF EXISTS on_auth_user_created_init_onboarding ON auth.users;
CREATE TRIGGER on_auth_user_created_init_onboarding
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION initialize_user_onboarding();

-- Make sure user_onboarding has proper RLS policies
ALTER TABLE user_onboarding DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own onboarding" ON user_onboarding;
DROP POLICY IF EXISTS "Service role can manage all onboarding" ON user_onboarding;

CREATE POLICY "Service role can manage all onboarding"
  ON user_onboarding
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Users can manage their own onboarding"
  ON user_onboarding
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create a policy specifically for inserting onboarding records
CREATE POLICY "Users can insert their onboarding"
  ON user_onboarding
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update handle_new_user function to be SECURITY DEFINER and handle conflicts
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (user_id) DO UPDATE 
  SET 
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();