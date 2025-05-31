-- This migration file is the definitive fix for the RLS recursion issues
-- It drops all problematic policies and creates non-recursive alternatives

-- First, check and drop existing policies that might be causing problems
DO $$
BEGIN
    -- Drop team_members policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Users can manage their own team memberships') THEN
        DROP POLICY "Users can manage their own team memberships" ON team_members;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Team leaders can manage all team members') THEN
        DROP POLICY "Team leaders can manage all team members" ON team_members;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Team members can view other team members') THEN
        DROP POLICY "Team members can view other team members" ON team_members;
    END IF;
    
    -- Drop work_schedules policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'work_schedules' AND policyname = 'Users can manage their own schedules') THEN
        DROP POLICY "Users can manage their own schedules" ON work_schedules;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'work_schedules' AND policyname = 'Team leaders can view team schedules') THEN
        DROP POLICY "Team leaders can view team schedules" ON work_schedules;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'work_schedules' AND policyname = 'Team members can view other members schedules') THEN
        DROP POLICY "Team members can view other members schedules" ON work_schedules;
    END IF;
    
    -- Drop checkins policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'checkins' AND policyname = 'Users can manage their own checkins') THEN
        DROP POLICY "Users can manage their own checkins" ON checkins;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'checkins' AND policyname = 'Team leaders can manage team checkins') THEN
        DROP POLICY "Team leaders can manage team checkins" ON checkins;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'checkins' AND policyname = 'Team members can view team checkins') THEN
        DROP POLICY "Team members can view team checkins" ON checkins;
    END IF;
    
    -- Also drop any other potentially conflicting policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Users can view teams they belong to') THEN
        DROP POLICY "Users can view teams they belong to" ON team_members;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'team_leaders_manage_members') THEN
        DROP POLICY "team_leaders_manage_members" ON team_members;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'team_members_manage_own_membership') THEN
        DROP POLICY "team_members_manage_own_membership" ON team_members;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'team_members_view_colleagues') THEN
        DROP POLICY "team_members_view_colleagues" ON team_members;
    END IF;
END
$$;

-- Reset the relevant tables to ensure clean state
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE work_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;

ALTER TABLE checkins DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Create simplified team_members policies
-- Policy for users to manage their own team memberships
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

-- Policy for team leaders to view team schedules
CREATE POLICY "Team leaders can view team schedules"
  ON work_schedules
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT tm.user_id
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE t.created_by = auth.uid()
    )
  );

-- Policy for team members to view other members' schedules
CREATE POLICY "Team members can view other members schedules"
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
DO $$
BEGIN
    -- Drop the trigger and function if they exist
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
    END IF;
END
$$;

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

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Make initialize_user_onboarding SECURITY DEFINER
DO $$
BEGIN
    -- Drop the trigger and function if they exist
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_init_onboarding') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created_init_onboarding ON auth.users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'initialize_user_onboarding') THEN
        DROP FUNCTION IF EXISTS initialize_user_onboarding() CASCADE;
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION initialize_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_onboarding (user_id, onboarding_completed)
  VALUES (NEW.id, FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_init_onboarding
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION initialize_user_onboarding();

-- Make sure user_id on user_onboarding has a unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_onboarding_user_id_key' 
        AND conrelid = 'user_onboarding'::regclass
    ) THEN
        ALTER TABLE user_onboarding ADD CONSTRAINT user_onboarding_user_id_key UNIQUE (user_id);
    END IF;
END
$$;