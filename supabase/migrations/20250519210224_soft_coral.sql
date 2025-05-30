/*
  # Fix User Onboarding Permissions

  1. Changes
    - Add proper RLS policies for the user_onboarding table
    - Ensure service role has necessary permissions
    - Fix insert permission for new users
    - Make the handle_new_user function security definer

  2. Purpose
    - Fix permission errors when accessing the user_onboarding table
    - Allow authenticated users to properly complete the onboarding process
    - Prevent 406 errors during onboarding flows
*/

-- First make sure RLS is enabled
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Users can manage their own onboarding" ON user_onboarding;

-- Create a policy for service role to manage all onboarding
CREATE POLICY "Service role can manage all onboarding" 
ON user_onboarding
FOR ALL
TO service_role
USING (true);

-- Create a policy for users to manage their own onboarding
CREATE POLICY "Users can manage their own onboarding" 
ON user_onboarding
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Allow users to insert their own onboarding record
CREATE POLICY "Users can insert their onboarding" 
ON user_onboarding
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create a function to initialize user_onboarding when a user is created
CREATE OR REPLACE FUNCTION initialize_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_onboarding (user_id, onboarding_completed)
  VALUES (NEW.id, FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to initialize user_onboarding when a user is created
DROP TRIGGER IF EXISTS on_auth_user_created_init_onboarding ON auth.users;
CREATE TRIGGER on_auth_user_created_init_onboarding
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION initialize_user_onboarding();

-- Add index on user_id for better performance
CREATE INDEX IF NOT EXISTS user_onboarding_user_id_idx ON user_onboarding (user_id);