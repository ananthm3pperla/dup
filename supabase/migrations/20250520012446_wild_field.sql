/*
  # Fix the duplicate key issue with user_onboarding

  1. Changes
    - Add ON CONFLICT DO NOTHING to the initialize_user_onboarding function
    - Create a UNIQUE constraint on user_id if it doesn't exist
    - Update the function to be SECURITY DEFINER

  2. Purpose
    - Prevent duplicate key errors when creating onboarding records
    - Fix race conditions in the onboarding flow
    - Ensure proper permissions for the function
*/

-- Update the function to handle conflicts
CREATE OR REPLACE FUNCTION initialize_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with ON CONFLICT DO NOTHING to prevent duplicate key errors
  INSERT INTO public.user_onboarding (user_id, onboarding_completed)
  VALUES (NEW.id, FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the user_id column has a UNIQUE constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage
    WHERE table_name = 'user_onboarding'
    AND column_name = 'user_id'
    AND constraint_name LIKE '%_key'
  ) THEN
    ALTER TABLE user_onboarding ADD CONSTRAINT user_onboarding_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Make sure RLS is enabled
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- Recreate the trigger to ensure it's using the updated function
DROP TRIGGER IF EXISTS on_auth_user_created_init_onboarding ON auth.users;

CREATE TRIGGER on_auth_user_created_init_onboarding
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION initialize_user_onboarding();