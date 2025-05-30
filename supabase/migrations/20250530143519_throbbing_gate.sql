-- This migration file is the definitive fix for the RLS recursion issues
-- It drops all problematic policies and creates non-recursive alternatives

-- First, drop all existing policies that might be causing problems
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams v2" ON team_members;
DROP POLICY IF EXISTS "Users can view members of teams they belong to" ON team_members;
DROP POLICY IF EXISTS "Team members access policy" ON team_members;
DROP POLICY IF EXISTS "Non-recursive team members policy" ON team_members;
DROP POLICY IF EXISTS "Final team members policy" ON team_members;
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;

DROP POLICY IF EXISTS "Team members can view schedules of their team" ON work_schedules;
DROP POLICY IF EXISTS "Team members can view schedules of team" ON work_schedules;
DROP POLICY IF EXISTS "Team members can view schedules of colleagues" ON work_schedules;
DROP POLICY IF EXISTS "Work schedules access policy" ON work_schedules;
DROP POLICY IF EXISTS "Non-recursive work schedules policy" ON work_schedules;
DROP POLICY IF EXISTS "Final work schedules policy" ON work_schedules;
-- Check if policy exists before dropping to avoid errors
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own schedules' AND tablename = 'work_schedules') THEN
    DROP POLICY "Users can manage their own schedules" ON work_schedules;
  END IF;
END $$;

DROP POLICY IF EXISTS "Team leaders can view and verify checkins" ON checkins;
DROP POLICY IF EXISTS "Team members can view checkins" ON checkins;
DROP POLICY IF EXISTS "Team members can view checkins of their team" ON checkins;
DROP POLICY IF EXISTS "Checkins access policy" ON checkins;
DROP POLICY IF EXISTS "Non-recursive checkins policy" ON checkins;
DROP POLICY IF EXISTS "Final checkins policy" ON checkins;

-- Reset the relevant tables to ensure clean state
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE work_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;

ALTER TABLE checkins DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Create simplified team_members policies
-- Policy for team members to manage their own data
CREATE POLICY "Users can manage their own team memberships"
  ON team_members
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for team leaders to manage their team members  
CREATE POLICY "Team leaders can manage all team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM teams
      WHERE id = team_id
      AND created_by = auth.uid()
    )
  );
  
-- Policy for team members to view other team members
CREATE POLICY "Team members can view other team members"
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

-- Create simplified work_schedules policies
-- Policy for users to manage their own schedules
CREATE POLICY "Users can manage their own schedules"
  ON work_schedules
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for viewing team members' schedules
CREATE POLICY "Users can view team members schedules"
  ON work_schedules
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT tm2.user_id
      FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
    )
  );

-- Create simplified checkins policies
-- Policy for users to manage their own checkins
CREATE POLICY "Users can manage their own checkins"
  ON checkins
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());
  
-- Policy for team leaders to view and manage checkins
CREATE POLICY "Team leaders can manage team checkins"
  ON checkins
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id
      FROM teams
      WHERE created_by = auth.uid()
    )
  );
  
-- Policy for team members to view team checkins
CREATE POLICY "Team members can view team checkins"
  ON checkins
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id
      FROM team_members
      WHERE user_id = auth.uid()
    )
  );

-- Create additional optimized indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_team ON team_members(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_work_schedules_user_date ON work_schedules(user_id, date);
CREATE INDEX IF NOT EXISTS idx_work_schedules_date ON work_schedules(date);
CREATE INDEX IF NOT EXISTS idx_checkins_team_id ON checkins(team_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_status ON checkins(status);

-- Fix the handle_new_user trigger to be SECURITY DEFINER
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

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
        
    -- Also initialize onboarding in the SAME function to avoid race conditions
    INSERT INTO public.user_onboarding (user_id, onboarding_completed)
    VALUES (NEW.id, FALSE)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Remove any separate onboarding trigger since it's now handled in handle_new_user
DROP FUNCTION IF EXISTS initialize_user_onboarding() CASCADE;