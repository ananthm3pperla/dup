-- This migration file is the definitive fix for the RLS recursion issues
-- It drops all problematic policies and creates non-recursive alternatives

-- First, check and drop all existing policies that might be causing problems
DO $$ 
BEGIN
  -- Team members policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view team members of their teams' AND tablename = 'team_members') THEN
    DROP POLICY "Users can view team members of their teams" ON team_members;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view team members of their teams v2' AND tablename = 'team_members') THEN
    DROP POLICY "Users can view team members of their teams v2" ON team_members;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view members of teams they belong to' AND tablename = 'team_members') THEN
    DROP POLICY "Users can view members of teams they belong to" ON team_members;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members access policy' AND tablename = 'team_members') THEN
    DROP POLICY "Team members access policy" ON team_members;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Non-recursive team members policy' AND tablename = 'team_members') THEN
    DROP POLICY "Non-recursive team members policy" ON team_members;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Final team members policy' AND tablename = 'team_members') THEN
    DROP POLICY "Final team members policy" ON team_members;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view their teams' AND tablename = 'teams') THEN
    DROP POLICY "Team members can view their teams" ON teams;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own team memberships' AND tablename = 'team_members') THEN
    DROP POLICY "Users can manage their own team memberships" ON team_members;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team leaders can manage all team members' AND tablename = 'team_members') THEN
    DROP POLICY "Team leaders can manage all team members" ON team_members;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view other team members' AND tablename = 'team_members') THEN
    DROP POLICY "Team members can view other team members" ON team_members;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'team_members_manage_own_membership' AND tablename = 'team_members') THEN
    DROP POLICY "team_members_manage_own_membership" ON team_members;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'team_leaders_manage_members' AND tablename = 'team_members') THEN
    DROP POLICY "team_leaders_manage_members" ON team_members;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'team_members_view_colleagues' AND tablename = 'team_members') THEN
    DROP POLICY "team_members_view_colleagues" ON team_members;
  END IF;

  -- Work schedules policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view schedules of their team' AND tablename = 'work_schedules') THEN
    DROP POLICY "Team members can view schedules of their team" ON work_schedules;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view schedules of team' AND tablename = 'work_schedules') THEN
    DROP POLICY "Team members can view schedules of team" ON work_schedules;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view schedules of colleagues' AND tablename = 'work_schedules') THEN
    DROP POLICY "Team members can view schedules of colleagues" ON work_schedules;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Work schedules access policy' AND tablename = 'work_schedules') THEN
    DROP POLICY "Work schedules access policy" ON work_schedules;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Non-recursive work schedules policy' AND tablename = 'work_schedules') THEN
    DROP POLICY "Non-recursive work schedules policy" ON work_schedules;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Final work schedules policy' AND tablename = 'work_schedules') THEN
    DROP POLICY "Final work schedules policy" ON work_schedules;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own schedules' AND tablename = 'work_schedules') THEN
    DROP POLICY "Users can manage their own schedules" ON work_schedules;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view team members schedules' AND tablename = 'work_schedules') THEN
    DROP POLICY "Users can view team members schedules" ON work_schedules;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'work_schedules_manage_own' AND tablename = 'work_schedules') THEN
    DROP POLICY "work_schedules_manage_own" ON work_schedules;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'work_schedules_view_team' AND tablename = 'work_schedules') THEN
    DROP POLICY "work_schedules_view_team" ON work_schedules;
  END IF;

  -- Checkin policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team leaders can view and verify checkins' AND tablename = 'checkins') THEN
    DROP POLICY "Team leaders can view and verify checkins" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view checkins' AND tablename = 'checkins') THEN
    DROP POLICY "Team members can view checkins" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view checkins of their team' AND tablename = 'checkins') THEN
    DROP POLICY "Team members can view checkins of their team" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Checkins access policy' AND tablename = 'checkins') THEN
    DROP POLICY "Checkins access policy" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Non-recursive checkins policy' AND tablename = 'checkins') THEN
    DROP POLICY "Non-recursive checkins policy" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Final checkins policy' AND tablename = 'checkins') THEN
    DROP POLICY "Final checkins policy" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own checkins' AND tablename = 'checkins') THEN
    DROP POLICY "Users can manage their own checkins" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own checkins' AND tablename = 'checkins') THEN
    DROP POLICY "Users can manage own checkins" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team leaders can manage team checkins' AND tablename = 'checkins') THEN
    DROP POLICY "Team leaders can manage team checkins" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view team checkins' AND tablename = 'checkins') THEN
    DROP POLICY "Team members can view team checkins" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkins_manage_own' AND tablename = 'checkins') THEN
    DROP POLICY "checkins_manage_own" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkins_leaders_manage' AND tablename = 'checkins') THEN
    DROP POLICY "checkins_leaders_manage" ON checkins;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkins_members_view' AND tablename = 'checkins') THEN
    DROP POLICY "checkins_members_view" ON checkins;
  END IF;
END $$;

-- Reset the relevant tables to ensure clean state
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE work_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;

ALTER TABLE checkins DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Create new policies only if they don't already exist
DO $$ 
BEGIN
  -- Team members policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'team_members_manage_own_membership' AND tablename = 'team_members') THEN
    CREATE POLICY "team_members_manage_own_membership"
      ON team_members
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'team_leaders_manage_members' AND tablename = 'team_members') THEN
    CREATE POLICY "team_leaders_manage_members"
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
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'team_members_view_colleagues' AND tablename = 'team_members') THEN
    CREATE POLICY "team_members_view_colleagues"
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
  END IF;

  -- Work schedules policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'work_schedules_manage_own' AND tablename = 'work_schedules') THEN
    CREATE POLICY "work_schedules_manage_own"
      ON work_schedules
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'work_schedules_view_team' AND tablename = 'work_schedules') THEN
    CREATE POLICY "work_schedules_view_team"
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
  END IF;

  -- Checkins policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkins_manage_own' AND tablename = 'checkins') THEN
    CREATE POLICY "checkins_manage_own"
      ON checkins
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkins_leaders_manage' AND tablename = 'checkins') THEN
    CREATE POLICY "checkins_leaders_manage"
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
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkins_members_view' AND tablename = 'checkins') THEN
    CREATE POLICY "checkins_members_view"
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
  END IF;
END $$;

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
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
  END IF;
END $$;

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

-- Check if trigger exists before creating
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Remove any separate onboarding trigger since it's now handled in handle_new_user
DROP FUNCTION IF EXISTS initialize_user_onboarding() CASCADE;