/*
  # Team Functions

  1. New Functions
    - `get_team_schedule` - Get team schedule for a date range
    - `get_team_anchor_days` - Get team anchor days for a week
    - `validate_team_invite` - Validate a team invite code
    - `join_team_with_invite` - Join a team with an invite code

  2. Purpose
    - These functions help with team-related operations
    - They provide a secure way to interact with team data
    - They encapsulate business logic for team operations
*/

-- Function to get team schedule for a date range
CREATE OR REPLACE FUNCTION get_team_schedule(
  p_team_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  date DATE,
  office_count INTEGER,
  remote_count INTEGER,
  flexible_count INTEGER,
  members JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH team_users AS (
    SELECT user_id
    FROM team_members
    WHERE team_id = p_team_id
  ),
  user_schedules AS (
    SELECT
      ws.date,
      ws.user_id,
      ws.work_type,
      p.full_name,
      p.avatar_url
    FROM work_schedules ws
    JOIN team_users tu ON ws.user_id = tu.user_id
    JOIN profiles p ON ws.user_id = p.user_id
    WHERE ws.date BETWEEN p_start_date AND p_end_date
  )
  SELECT
    d.date::DATE,
    COUNT(CASE WHEN us.work_type = 'office' THEN 1 END)::INTEGER AS office_count,
    COUNT(CASE WHEN us.work_type = 'remote' THEN 1 END)::INTEGER AS remote_count,
    COUNT(CASE WHEN us.work_type = 'flexible' THEN 1 END)::INTEGER AS flexible_count,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'user_id', us.user_id,
          'full_name', us.full_name,
          'avatar_url', us.avatar_url,
          'work_type', us.work_type
        )
      ) FILTER (WHERE us.user_id IS NOT NULL),
      '[]'::jsonb
    ) AS members
  FROM (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::DATE AS date
  ) d
  LEFT JOIN user_schedules us ON d.date = us.date
  GROUP BY d.date
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql;

-- Function to get team anchor days for a week
CREATE OR REPLACE FUNCTION get_team_anchor_days(
  p_team_id UUID,
  p_week_start DATE
)
RETURNS TABLE (
  date DATE,
  is_anchor_day BOOLEAN,
  office_count INTEGER,
  total_count INTEGER
) AS $$
DECLARE
  p_week_end DATE := p_week_start + INTERVAL '6 days';
  team_size INTEGER;
BEGIN
  -- Get team size
  SELECT COUNT(*) INTO team_size
  FROM team_members
  WHERE team_id = p_team_id;

  RETURN QUERY
  WITH daily_counts AS (
    SELECT
      ws.date,
      COUNT(CASE WHEN ws.work_type = 'office' THEN 1 END) AS office_count,
      COUNT(*) AS total_count
    FROM work_schedules ws
    JOIN team_members tm ON ws.user_id = tm.user_id
    WHERE tm.team_id = p_team_id
    AND ws.date BETWEEN p_week_start AND p_week_end
    GROUP BY ws.date
  ),
  voted_days AS (
    SELECT
      unnest(voted_days)::DATE AS date,
      COUNT(*) AS vote_count
    FROM team_votes
    WHERE team_id = p_team_id
    AND voting_week = p_week_start
    GROUP BY date
  )
  SELECT
    d.date::DATE,
    CASE
      -- Consider a day an anchor day if:
      -- 1. More than 50% of team members with schedules are in office
      WHEN dc.office_count > dc.total_count / 2 AND dc.total_count > 0 THEN TRUE
      -- 2. More than 50% of team members voted for this day
      WHEN vd.vote_count > team_size / 2 AND team_size > 0 THEN TRUE
      ELSE FALSE
    END AS is_anchor_day,
    COALESCE(dc.office_count, 0)::INTEGER AS office_count,
    COALESCE(dc.total_count, 0)::INTEGER AS total_count
  FROM (
    SELECT generate_series(p_week_start, p_week_end, '1 day'::interval)::DATE AS date
  ) d
  LEFT JOIN daily_counts dc ON d.date = dc.date
  LEFT JOIN voted_days vd ON d.date = vd.date
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql;

-- Function to validate a team invite code
CREATE OR REPLACE FUNCTION validate_team_invite(
  p_invite_code TEXT
)
RETURNS TABLE (
  valid BOOLEAN,
  team_id UUID,
  team_name TEXT,
  team_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TRUE AS valid,
    t.id AS team_id,
    t.name AS team_name,
    t.description AS team_description
  FROM teams t
  WHERE t.invite_code = p_invite_code;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to join a team with an invite code
CREATE OR REPLACE FUNCTION join_team_with_invite(
  p_user_id UUID,
  p_invite_code TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  team_id UUID,
  team_name TEXT,
  message TEXT
) AS $$
DECLARE
  v_team_id UUID;
  v_team_name TEXT;
BEGIN
  -- Get team by invite code
  SELECT id, name INTO v_team_id, v_team_name
  FROM teams
  WHERE invite_code = p_invite_code;

  IF v_team_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Invalid invite code'::TEXT;
    RETURN;
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = v_team_id AND user_id = p_user_id
  ) THEN
    RETURN QUERY SELECT TRUE, v_team_id, v_team_name, 'Already a member of this team'::TEXT;
    RETURN;
  END IF;

  -- Add user to team
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (v_team_id, p_user_id, 'member');

  -- Return success
  RETURN QUERY SELECT TRUE, v_team_id, v_team_name, 'Successfully joined team'::TEXT;
END;
$$ LANGUAGE plpgsql;