/*
  # Views and Indexes

  1. New Views
    - `team_schedules_view` - View for team schedules
    - `team_compliance_view` - View for team compliance with RTO policy
    - `user_rewards_view` - View for user rewards

  2. New Indexes
    - Indexes on foreign keys and frequently queried columns
    - Indexes on date columns for schedule queries
    - Indexes on team and user IDs for faster lookups

  3. Purpose
    - Improve query performance
    - Simplify complex queries
    - Provide a consistent interface for common data access patterns
*/

-- Create view for team schedules
CREATE OR REPLACE VIEW team_schedules_view AS
SELECT
  tm.team_id,
  ws.date,
  COUNT(CASE WHEN ws.work_type = 'office' THEN 1 END) AS office_count,
  COUNT(CASE WHEN ws.work_type = 'remote' THEN 1 END) AS remote_count,
  COUNT(CASE WHEN ws.work_type = 'flexible' THEN 1 END) AS flexible_count,
  jsonb_agg(
    jsonb_build_object(
      'user_id', ws.user_id,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'work_type', ws.work_type
    )
  ) AS members
FROM team_members tm
JOIN work_schedules ws ON tm.user_id = ws.user_id
JOIN profiles p ON ws.user_id = p.user_id
GROUP BY tm.team_id, ws.date;

-- Create view for team compliance with RTO policy
CREATE OR REPLACE VIEW team_compliance_view AS
SELECT
  tm.team_id,
  ws.user_id,
  t.rto_policy->>'required_days' AS required_days,
  COUNT(CASE WHEN ws.work_type = 'office' THEN 1 END) AS office_days,
  COUNT(*) AS total_days,
  CASE
    WHEN (t.rto_policy->>'required_days')::INTEGER = 0 THEN 1.0
    ELSE LEAST(
      COUNT(CASE WHEN ws.work_type = 'office' THEN 1 END)::NUMERIC / NULLIF((t.rto_policy->>'required_days')::INTEGER, 0),
      1.0
    )
  END AS compliance_rate
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
LEFT JOIN work_schedules ws ON tm.user_id = ws.user_id
  AND ws.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY tm.team_id, ws.user_id, t.rto_policy;

-- Create view for user rewards
CREATE OR REPLACE VIEW user_rewards_view AS
SELECT
  rb.user_id,
  rb.team_id,
  t.name AS team_name,
  rb.current_balance,
  rb.total_earned,
  rb.total_used,
  rb.office_day_streak,
  rb.last_office_day,
  rp.accrual_model,
  rp.office_to_remote_ratio,
  rp.streak_bonus_threshold,
  rp.streak_bonus_amount,
  COUNT(rdr.id) AS pending_requests
FROM reward_balances rb
JOIN teams t ON rb.team_id = t.id
LEFT JOIN reward_policies rp ON t.id = rp.team_id
LEFT JOIN remote_day_requests rdr ON rb.user_id = rdr.user_id
  AND rb.team_id = rdr.team_id
  AND rdr.status = 'pending'
GROUP BY
  rb.user_id,
  rb.team_id,
  t.name,
  rb.current_balance,
  rb.total_earned,
  rb.total_used,
  rb.office_day_streak,
  rb.last_office_day,
  rp.accrual_model,
  rp.office_to_remote_ratio,
  rp.streak_bonus_threshold,
  rp.streak_bonus_amount;

-- Create indexes for better performance
-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);

-- Teams indexes
CREATE INDEX IF NOT EXISTS teams_created_by_idx ON teams(created_by);
CREATE INDEX IF NOT EXISTS teams_invite_code_idx ON teams(invite_code);

-- Team members indexes
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);
CREATE INDEX IF NOT EXISTS team_members_team_user_idx ON team_members(team_id, user_id);

-- Work schedules indexes
CREATE INDEX IF NOT EXISTS work_schedules_user_id_idx ON work_schedules(user_id);
CREATE INDEX IF NOT EXISTS work_schedules_date_idx ON work_schedules(date);
CREATE INDEX IF NOT EXISTS work_schedules_user_date_idx ON work_schedules(user_id, date);
CREATE INDEX IF NOT EXISTS work_schedules_work_type_idx ON work_schedules(work_type);

-- Team votes indexes
CREATE INDEX IF NOT EXISTS team_votes_team_id_idx ON team_votes(team_id);
CREATE INDEX IF NOT EXISTS team_votes_user_id_idx ON team_votes(user_id);
CREATE INDEX IF NOT EXISTS team_votes_voting_week_idx ON team_votes(voting_week);

-- User onboarding indexes
CREATE INDEX IF NOT EXISTS user_onboarding_user_id_idx ON user_onboarding(user_id);

-- User survey responses indexes
CREATE INDEX IF NOT EXISTS user_survey_responses_user_id_idx ON user_survey_responses(user_id);

-- Reward balances indexes
CREATE INDEX IF NOT EXISTS reward_balances_user_id_idx ON reward_balances(user_id);
CREATE INDEX IF NOT EXISTS reward_balances_team_id_idx ON reward_balances(team_id);
CREATE INDEX IF NOT EXISTS reward_balances_user_team_idx ON reward_balances(user_id, team_id);

-- Remote day requests indexes
CREATE INDEX IF NOT EXISTS remote_day_requests_user_id_idx ON remote_day_requests(user_id);
CREATE INDEX IF NOT EXISTS remote_day_requests_team_id_idx ON remote_day_requests(team_id);
CREATE INDEX IF NOT EXISTS remote_day_requests_date_idx ON remote_day_requests(date);
CREATE INDEX IF NOT EXISTS remote_day_requests_status_idx ON remote_day_requests(status);

-- Remote day approvals indexes
CREATE INDEX IF NOT EXISTS remote_day_approvals_request_id_idx ON remote_day_approvals(request_id);
CREATE INDEX IF NOT EXISTS remote_day_approvals_approver_id_idx ON remote_day_approvals(approver_id);

-- Checkins indexes
CREATE INDEX IF NOT EXISTS checkins_user_id_idx ON checkins(user_id);
CREATE INDEX IF NOT EXISTS checkins_team_id_idx ON checkins(team_id);
CREATE INDEX IF NOT EXISTS checkins_status_idx ON checkins(status);
CREATE INDEX IF NOT EXISTS checkins_checkin_time_idx ON checkins(checkin_time);

-- Team checkin settings indexes
CREATE INDEX IF NOT EXISTS team_checkin_settings_team_id_idx ON team_checkin_settings(team_id);

-- Reward policies indexes
CREATE INDEX IF NOT EXISTS reward_policies_team_id_idx ON reward_policies(team_id);

-- User work history indexes
CREATE INDEX IF NOT EXISTS user_work_history_user_id_idx ON user_work_history(user_id);

-- User education indexes
CREATE INDEX IF NOT EXISTS user_education_user_id_idx ON user_education(user_id);

-- User calendar connections indexes
CREATE INDEX IF NOT EXISTS user_calendar_connections_user_id_idx ON user_calendar_connections(user_id);
CREATE INDEX IF NOT EXISTS user_calendar_connections_provider_idx ON user_calendar_connections(provider);