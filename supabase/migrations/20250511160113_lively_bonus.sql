/*
  # Initial Schema Setup

  1. New Tables
    - `profiles` - User profile information
    - `teams` - Teams information
    - `team_members` - Team membership
    - `work_schedules` - User work schedules
    - `team_votes` - Team voting for office days
    - `user_onboarding` - User onboarding information
    - `user_survey_responses` - User survey responses
    - `reward_balances` - User reward balances
    - `remote_day_requests` - Remote day requests
    - `checkins` - Office check-ins
    - `team_checkin_settings` - Team check-in settings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add trigger for creating user profiles on signup
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  rto_policy JSONB NOT NULL DEFAULT '{"required_days": 3, "core_hours": {"start": "10:00", "end": "16:00"}, "allowed_work_types": ["office", "remote", "flexible"]}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(team_id, user_id)
);

-- Create work_schedules table
CREATE TABLE IF NOT EXISTS work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  work_type TEXT NOT NULL CHECK (work_type IN ('office', 'remote', 'flexible')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

-- Create team_votes table for voting on office days
CREATE TABLE IF NOT EXISTS team_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  voting_week DATE NOT NULL, -- Start date of the week being voted on
  voted_days TEXT[] NOT NULL, -- Array of dates in ISO format
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, team_id, voting_week)
);

-- Create user_onboarding table
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT,
  office_location TEXT,
  job_title TEXT,
  role_type TEXT,
  department TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_survey_responses table
CREATE TABLE IF NOT EXISTS user_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preferred_office_days INTEGER,
  office_motivators TEXT[],
  attendance_barriers TEXT[],
  additional_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create reward_balances table
CREATE TABLE IF NOT EXISTS reward_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  total_used NUMERIC NOT NULL DEFAULT 0,
  office_day_streak INTEGER NOT NULL DEFAULT 0,
  last_office_day TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, team_id)
);

-- Create remote_day_requests table
CREATE TABLE IF NOT EXISTS remote_day_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  days_requested NUMERIC NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reason TEXT,
  requires_high_limit_approval BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create remote_day_approvals table
CREATE TABLE IF NOT EXISTS remote_day_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES remote_day_requests(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES auth.users(id) NOT NULL,
  approval_level TEXT NOT NULL DEFAULT 'manager' CHECK (approval_level IN ('manager', 'director', 'vp')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  checkin_time TIMESTAMPTZ DEFAULT now() NOT NULL,
  photo_url TEXT,
  location_verified BOOLEAN DEFAULT FALSE,
  location_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create team_checkin_settings table
CREATE TABLE IF NOT EXISTS team_checkin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL UNIQUE,
  selfie_required BOOLEAN DEFAULT TRUE,
  location_verification BOOLEAN DEFAULT TRUE,
  auto_approval BOOLEAN DEFAULT FALSE,
  retention_days INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create reward_policies table
CREATE TABLE IF NOT EXISTS reward_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL UNIQUE,
  accrual_model TEXT NOT NULL DEFAULT 'ratio_based' CHECK (accrual_model IN ('ratio_based', 'simple_3_to_1', 'streak_based')),
  office_to_remote_ratio INTEGER NOT NULL DEFAULT 3,
  streak_bonus_threshold INTEGER NOT NULL DEFAULT 5,
  streak_bonus_amount NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_work_history table
CREATE TABLE IF NOT EXISTS user_work_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_education table
CREATE TABLE IF NOT EXISTS user_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER,
  honors TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_calendar_connections table
CREATE TABLE IF NOT EXISTS user_calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  calendar_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, provider)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_day_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_day_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_checkin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calendar_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for teams
CREATE POLICY "Any user can create a team"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team members can view their teams"
  ON teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = id
      AND team_members.user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Team leaders can update their teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Create policies for team_members
CREATE POLICY "Team leaders can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_id
      AND teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view team members of their teams"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_id
      AND tm.user_id = auth.uid()
    )
  );

-- Create policies for work_schedules
CREATE POLICY "Users can manage their own schedules"
  ON work_schedules FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team members can view schedules of their team"
  ON work_schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = tm.team_id
        AND team_members.user_id = work_schedules.user_id
      )
    )
  );

-- Create policies for team_votes
CREATE POLICY "Users can manage their own votes"
  ON team_votes FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team leaders can view all votes"
  ON team_votes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_id
      AND teams.created_by = auth.uid()
    )
  );

-- Create policies for user_onboarding
CREATE POLICY "Users can manage their own onboarding"
  ON user_onboarding FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for user_survey_responses
CREATE POLICY "Users can manage their own survey responses"
  ON user_survey_responses FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team leaders can view survey responses"
  ON user_survey_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = user_survey_responses.user_id
      AND EXISTS (
        SELECT 1 FROM teams
        WHERE teams.id = team_members.team_id
        AND teams.created_by = auth.uid()
      )
    )
  );

-- Create policies for reward_balances
CREATE POLICY "Users can view their own reward balances"
  ON reward_balances FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team leaders can manage reward balances"
  ON reward_balances FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_id
      AND teams.created_by = auth.uid()
    )
  );

-- Create policies for remote_day_requests
CREATE POLICY "Users can manage their own remote day requests"
  ON remote_day_requests FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team leaders can view and update remote day requests"
  ON remote_day_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_id
      AND teams.created_by = auth.uid()
    )
  );

-- Create policies for remote_day_approvals
CREATE POLICY "Approvers can manage approvals"
  ON remote_day_approvals FOR ALL
  TO authenticated
  USING (approver_id = auth.uid());

CREATE POLICY "Users can view their own request approvals"
  ON remote_day_approvals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM remote_day_requests
      WHERE remote_day_requests.id = request_id
      AND remote_day_requests.user_id = auth.uid()
    )
  );

-- Create policies for checkins
CREATE POLICY "Users can manage their own checkins"
  ON checkins FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team leaders can view and verify checkins"
  ON checkins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_id
      AND teams.created_by = auth.uid()
    )
  );

-- Create policies for team_checkin_settings
CREATE POLICY "Team leaders can manage checkin settings"
  ON team_checkin_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_id
      AND teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Team members can view checkin settings"
  ON team_checkin_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_checkin_settings.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Create policies for reward_policies
CREATE POLICY "Team leaders can manage reward policies"
  ON reward_policies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_id
      AND teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Team members can view reward policies"
  ON reward_policies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = reward_policies.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Create policies for user_work_history
CREATE POLICY "Users can manage their own work history"
  ON user_work_history FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view work history"
  ON user_work_history FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_education
CREATE POLICY "Users can manage their own education"
  ON user_education FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view education"
  ON user_education FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_calendar_connections
CREATE POLICY "Users can manage their own calendar connections"
  ON user_calendar_connections FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create a profile when a user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update timestamps
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_teams_timestamp
BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_work_schedules_timestamp
BEFORE UPDATE ON work_schedules
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_onboarding_timestamp
BEFORE UPDATE ON user_onboarding
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_reward_balances_timestamp
BEFORE UPDATE ON reward_balances
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_remote_day_requests_timestamp
BEFORE UPDATE ON remote_day_requests
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_team_checkin_settings_timestamp
BEFORE UPDATE ON team_checkin_settings
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_reward_policies_timestamp
BEFORE UPDATE ON reward_policies
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_work_history_timestamp
BEFORE UPDATE ON user_work_history
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_education_timestamp
BEFORE UPDATE ON user_education
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_calendar_connections_timestamp
BEFORE UPDATE ON user_calendar_connections
FOR EACH ROW EXECUTE FUNCTION update_timestamp();