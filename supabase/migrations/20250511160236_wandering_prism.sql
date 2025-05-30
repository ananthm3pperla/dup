/*
  # Reward Functions

  1. New Functions
    - `calculate_user_compliance` - Calculate user compliance with RTO policy
    - `update_reward_balance` - Update user reward balance based on office attendance
    - `process_remote_day_request` - Process a remote day request

  2. Purpose
    - These functions handle reward-related operations
    - They provide a secure way to calculate and update reward balances
    - They encapsulate business logic for reward operations
*/

-- Function to calculate user compliance with RTO policy
CREATE OR REPLACE FUNCTION calculate_user_compliance(
  p_user_id UUID,
  p_team_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS NUMERIC AS $$
DECLARE
  v_required_days INTEGER;
  v_office_days INTEGER;
  v_total_days INTEGER;
  v_compliance NUMERIC;
BEGIN
  -- Get required days from team policy
  SELECT (rto_policy->>'required_days')::INTEGER INTO v_required_days
  FROM teams
  WHERE id = p_team_id;

  -- If no policy exists, return 100% compliance
  IF v_required_days IS NULL OR v_required_days = 0 THEN
    RETURN 1.0;
  END IF;

  -- Count office days in the date range
  SELECT COUNT(*) INTO v_office_days
  FROM work_schedules
  WHERE user_id = p_user_id
    AND date BETWEEN p_start_date AND p_end_date
    AND work_type = 'office';

  -- Calculate total weekdays in the date range (excluding weekends)
  SELECT COUNT(*) INTO v_total_days
  FROM generate_series(p_start_date, p_end_date, '1 day'::interval) AS date
  WHERE EXTRACT(DOW FROM date) BETWEEN 1 AND 5; -- Monday to Friday

  -- Calculate compliance rate
  IF v_total_days = 0 THEN
    RETURN 1.0; -- No days to comply with
  ELSE
    v_compliance := LEAST(v_office_days::NUMERIC / (v_required_days * (v_total_days / 5.0)), 1.0);
    RETURN v_compliance;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update user reward balance based on office attendance
CREATE OR REPLACE FUNCTION update_reward_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_team_id UUID;
  v_accrual_model TEXT;
  v_ratio INTEGER;
  v_streak_threshold INTEGER;
  v_streak_bonus NUMERIC;
  v_current_streak INTEGER;
  v_reward_amount NUMERIC := 0;
BEGIN
  -- Only process office check-ins
  IF NEW.work_type != 'office' THEN
    RETURN NEW;
  END IF;

  -- Get the user's team
  SELECT team_id INTO v_team_id
  FROM team_members
  WHERE user_id = NEW.user_id
  LIMIT 1;

  IF v_team_id IS NULL THEN
    RETURN NEW; -- User not in a team
  END IF;

  -- Get reward policy
  SELECT 
    accrual_model,
    office_to_remote_ratio,
    streak_bonus_threshold,
    streak_bonus_amount,
    office_day_streak
  INTO 
    v_accrual_model,
    v_ratio,
    v_streak_threshold,
    v_streak_bonus,
    v_current_streak
  FROM reward_policies rp
  JOIN reward_balances rb ON rp.team_id = rb.team_id
  WHERE rp.team_id = v_team_id
    AND rb.user_id = NEW.user_id;

  -- Create reward balance if it doesn't exist
  IF v_accrual_model IS NULL THEN
    INSERT INTO reward_balances (user_id, team_id, office_day_streak, last_office_day)
    VALUES (NEW.user_id, v_team_id, 1, NEW.date)
    RETURNING office_day_streak INTO v_current_streak;
    
    -- Get default policy values
    SELECT 
      accrual_model,
      office_to_remote_ratio,
      streak_bonus_threshold,
      streak_bonus_amount
    INTO 
      v_accrual_model,
      v_ratio,
      v_streak_threshold,
      v_streak_bonus
    FROM reward_policies
    WHERE team_id = v_team_id;
    
    -- If still no policy, use defaults
    IF v_accrual_model IS NULL THEN
      v_accrual_model := 'ratio_based';
      v_ratio := 3;
      v_streak_threshold := 5;
      v_streak_bonus := 1;
    END IF;
  ELSE
    -- Update streak
    UPDATE reward_balances
    SET 
      office_day_streak = office_day_streak + 1,
      last_office_day = NEW.date
    WHERE user_id = NEW.user_id AND team_id = v_team_id
    RETURNING office_day_streak INTO v_current_streak;
  END IF;

  -- Calculate reward based on accrual model
  CASE v_accrual_model
    WHEN 'ratio_based' THEN
      v_reward_amount := 1.0 / v_ratio;
    WHEN 'simple_3_to_1' THEN
      v_reward_amount := 1.0 / 3;
    WHEN 'streak_based' THEN
      v_reward_amount := 1.0 / v_ratio;
      -- Add bonus if streak threshold reached
      IF v_current_streak >= v_streak_threshold AND v_current_streak % v_streak_threshold = 0 THEN
        v_reward_amount := v_reward_amount + v_streak_bonus;
      END IF;
  END CASE;

  -- Update reward balance
  UPDATE reward_balances
  SET 
    current_balance = current_balance + v_reward_amount,
    total_earned = total_earned + v_reward_amount
  WHERE user_id = NEW.user_id AND team_id = v_team_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating reward balance
CREATE TRIGGER update_reward_on_office_day
AFTER INSERT ON work_schedules
FOR EACH ROW
EXECUTE FUNCTION update_reward_balance();

-- Function to process a remote day request
CREATE OR REPLACE FUNCTION process_remote_day_request()
RETURNS TRIGGER AS $$
DECLARE
  v_balance NUMERIC;
  v_team_id UUID;
BEGIN
  -- Only process new requests
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Get user's current balance
  SELECT current_balance, team_id INTO v_balance, v_team_id
  FROM reward_balances
  WHERE user_id = NEW.user_id AND team_id = NEW.team_id;

  -- If no balance found, create one with zero balance
  IF v_balance IS NULL THEN
    INSERT INTO reward_balances (user_id, team_id, current_balance)
    VALUES (NEW.user_id, NEW.team_id, 0)
    RETURNING current_balance, team_id INTO v_balance, v_team_id;
  END IF;

  -- Check if request requires high limit approval (more than current balance)
  IF NEW.days_requested > v_balance THEN
    NEW.requires_high_limit_approval := TRUE;
  ELSE
    -- Deduct from balance for pending requests
    UPDATE reward_balances
    SET current_balance = current_balance - NEW.days_requested
    WHERE user_id = NEW.user_id AND team_id = NEW.team_id;
    
    -- Update total used
    UPDATE reward_balances
    SET total_used = total_used + NEW.days_requested
    WHERE user_id = NEW.user_id AND team_id = NEW.team_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for processing remote day requests
CREATE TRIGGER process_remote_day_request
BEFORE INSERT ON remote_day_requests
FOR EACH ROW
EXECUTE FUNCTION process_remote_day_request();

-- Function to handle remote day request status changes
CREATE OR REPLACE FUNCTION handle_remote_day_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  -- Only process status changes
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- Get user's current balance
  SELECT current_balance INTO v_balance
  FROM reward_balances
  WHERE user_id = NEW.user_id AND team_id = NEW.team_id;

  -- Handle status changes
  CASE NEW.status
    WHEN 'approved' THEN
      -- If it was pending with high limit approval, deduct now
      IF OLD.status = 'pending' AND OLD.requires_high_limit_approval THEN
        UPDATE reward_balances
        SET 
          current_balance = current_balance - NEW.days_requested,
          total_used = total_used + NEW.days_requested
        WHERE user_id = NEW.user_id AND team_id = NEW.team_id;
      END IF;
    WHEN 'rejected' THEN
      -- If it was pending without high limit approval, refund
      IF OLD.status = 'pending' AND NOT OLD.requires_high_limit_approval THEN
        UPDATE reward_balances
        SET 
          current_balance = current_balance + NEW.days_requested,
          total_used = total_used - NEW.days_requested
        WHERE user_id = NEW.user_id AND team_id = NEW.team_id;
      END IF;
    WHEN 'cancelled' THEN
      -- If it was pending without high limit approval, refund
      IF OLD.status = 'pending' AND NOT OLD.requires_high_limit_approval THEN
        UPDATE reward_balances
        SET 
          current_balance = current_balance + NEW.days_requested,
          total_used = total_used - NEW.days_requested
        WHERE user_id = NEW.user_id AND team_id = NEW.team_id;
      END IF;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for handling remote day request status changes
CREATE TRIGGER handle_remote_day_status_change
AFTER UPDATE ON remote_day_requests
FOR EACH ROW
EXECUTE FUNCTION handle_remote_day_status_change();