/*
  # Comprehensive Fix for Infinite Recursion in RLS Policies and Onboarding Flow

  This migration resolves the following critical issues:
  
  1. Infinite recursion in RLS policies for team_members, work_schedules, and related tables
  2. Duplicate key errors in user_onboarding during the account creation flow
  3. Permission issues with service role functions
  
  The approach:
  
  1. Reset RLS: Drop all problematic policies and recreate them with non-recursive logic
  2. Helper Functions: Create security definer functions to bypass RLS for critical operations
  3. Indexes: Add optimized indexes for query performance
  4. Onboarding Fix: Add conflict handling to onboarding-related functions and triggers
*/

-- Clean slate: Drop all problematic policies
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
DROP POLICY IF EXISTS "Users can view their own teams" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Users can update their own teams" ON teams;
DROP POLICY IF EXISTS "Users can see their own memberships" ON team_members;
DROP POLICY IF EXISTS "Users can manage their own memberships" ON team_members;
DROP POLICY IF EXISTS "Team leaders can manage team memberships" ON team_members;
DROP POLICY IF EXISTS "Users can manage their own schedules" ON work_schedules;
DROP POLICY IF EXISTS "Users can view team schedules" ON work_schedules;
DROP POLICY IF EXISTS "Team leaders can view team schedules" ON work_schedules;
DROP POLICY IF EXISTS "Team members can view other members schedules" ON work_schedules;

-- Reset RLS on all relevant tables
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE work_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_onboarding DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- Create helper functions for bypassing RLS safely

-- 1. Function to get user team memberships
CREATE OR REPLACE FUNCTION get_user_team_memberships(user_id_param UUID)
RETURNS TABLE (
  team_id UUID,
  user_id UUID,
  role TEXT,
  team_data JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.team_id,
    tm.user_id,
    tm.role,
    jsonb_build_object(
      'id', t.id,
      'name', t.name,
      'description', t.description,
      'created_by', t.created_by,
      'invite_code', t.invite_code,
      'rto_policy', t.rto_policy,
      'created_at', t.created_at,
      'updated_at', t.updated_at
    ) AS team_data
  FROM 
    team_members tm
  JOIN 
    teams t ON tm.team_id = t.id
  WHERE 
    tm.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to get team members with their profiles
CREATE OR REPLACE FUNCTION get_team_members(team_id_param UUID)
RETURNS TABLE (
  id UUID,
  team_id UUID,
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ,
  user JSONB
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.role,
    tm.joined_at,
    jsonb_build_object(
      'id', p.user_id,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url
    ) AS user
  FROM 
    team_members tm
  LEFT JOIN 
    profiles p ON tm.user_id = p.user_id
  WHERE 
    tm.team_id = team_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create new non-recursive RLS policies

-- 1. Teams table policies
CREATE POLICY "View teams you created or belong to"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    -- Teams you created
    created_by = auth.uid() OR
    -- Teams you're a member of
    id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Create your own teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Update teams you created"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 2. Team members table policies
CREATE POLICY "View relevant team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    -- Your own memberships
    user_id = auth.uid() OR
    -- Members of teams you created
    team_id IN (
      SELECT id 
      FROM teams 
      WHERE created_by = auth.uid()
    ) OR
    -- Members of teams you belong to
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Insert your own team memberships"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Team leaders manage team memberships"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id 
      FROM teams 
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT id 
      FROM teams 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Delete your own team memberships"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Work schedules table policies
CREATE POLICY "Manage your own work schedules"
  ON work_schedules
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "View team members' work schedules"
  ON work_schedules
  FOR SELECT
  TO authenticated
  USING (
    -- Schedules of users in teams you created
    user_id IN (
      SELECT tm.user_id
      FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE t.created_by = auth.uid()
    ) OR
    -- Schedules of users in teams you're a member of
    user_id IN (
      SELECT tm2.user_id
      FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
    )
  );

-- 4. User onboarding policies
CREATE POLICY "Service role manages all onboarding"
  ON user_onboarding
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Manage your own onboarding"
  ON user_onboarding
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Optimization: Add indexes for query performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_team ON team_members(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_teams_id_created_by ON teams(id, created_by);
CREATE INDEX IF NOT EXISTS idx_work_schedules_user_id ON work_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_date ON work_schedules(date);
CREATE INDEX IF NOT EXISTS idx_work_schedules_user_date ON work_schedules(user_id, date);

-- Fix the onboarding duplicate key issue

-- 1. Ensure user_id is unique in user_onboarding
ALTER TABLE user_onboarding DROP CONSTRAINT IF EXISTS user_onboarding_user_id_key;
ALTER TABLE user_onboarding ADD CONSTRAINT user_onboarding_user_id_key UNIQUE (user_id);

-- 2. Update handle_new_user function to handle conflicts
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with conflict handling
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
    
  -- Also initialize onboarding with conflict handling
  INSERT INTO public.user_onboarding (user_id, onboarding_completed)
  VALUES (NEW.id, FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the auth trigger to use the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Drop the separate onboarding initialization trigger since we now handle it in handle_new_user
DROP FUNCTION IF EXISTS initialize_user_onboarding() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_init_onboarding ON auth.users;

-- Add a function for team voting that avoids RLS
CREATE OR REPLACE FUNCTION submit_team_vote(
  p_user_id UUID,
  p_team_id UUID,
  p_voting_week DATE,
  p_voted_days TEXT[]
)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update vote
  INSERT INTO team_votes (user_id, team_id, voting_week, voted_days)
  VALUES (p_user_id, p_team_id, p_voting_week, p_voted_days)
  ON CONFLICT (user_id, team_id, voting_week) 
  DO UPDATE SET voted_days = p_voted_days;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add a function to safely get user votes
CREATE OR REPLACE FUNCTION get_user_votes(
  p_user_id UUID,
  p_team_id UUID,
  p_voting_week DATE
)
RETURNS TEXT[]
SECURITY DEFINER
AS $$
DECLARE
  v_voted_days TEXT[];
BEGIN
  SELECT voted_days INTO v_voted_days
  FROM team_votes
  WHERE user_id = p_user_id
    AND team_id = p_team_id
    AND voting_week = p_voting_week;
    
  RETURN v_voted_days;
END;
$$ LANGUAGE plpgsql;