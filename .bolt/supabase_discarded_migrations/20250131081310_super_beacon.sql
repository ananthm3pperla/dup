/*
  # Create Sacramento Kings RTO Policy
  
  1. Changes
    - Insert default RTO policy for Sacramento Kings
    - Add policy metadata and configuration
    - Set core hours and attendance requirements
  
  2. Policy Details
    - 3 minimum office days per week
    - Friday designated as remote day
    - Core hours 9:00 AM - 5:00 PM
    - Department-specific overrides allowed
*/

-- Insert Kings RTO policy
INSERT INTO rto_policies (
  company_id,
  name,
  description,
  allowed_days,
  fixed_remote_days,
  min_office_days,
  max_remote_days,
  core_hours,
  department_overrides
) VALUES (
  '00000000-0000-0000-0000-000000000000',  -- Default company ID
  'Sacramento Kings Hybrid Work Policy',
  'Standard hybrid work policy for Sacramento Kings employees promoting team collaboration while maintaining flexibility',
  ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],  -- Working days
  ARRAY['Friday'],  -- Fixed remote days
  3,  -- Minimum office days per week
  4,  -- Maximum remote/flexible days per week
  '{"start": "09:00", "end": "17:00"}'::jsonb,  -- Core hours
  '{
    "Basketball Operations": {
      "min_office_days": 4,
      "core_hours": {"start": "08:00", "end": "18:00"}
    },
    "Game Day Operations": {
      "min_office_days": 5,
      "fixed_remote_days": []
    }
  }'::jsonb  -- Department-specific overrides
)
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  allowed_days = EXCLUDED.allowed_days,
  fixed_remote_days = EXCLUDED.fixed_remote_days,
  min_office_days = EXCLUDED.min_office_days,
  max_remote_days = EXCLUDED.max_remote_days,
  core_hours = EXCLUDED.core_hours,
  department_overrides = EXCLUDED.department_overrides,
  updated_at = now();