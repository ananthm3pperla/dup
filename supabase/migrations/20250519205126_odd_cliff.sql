/*
  # Fix Profiles Table Permissions

  1. Changes
    - Update RLS policies for the profiles table
    - Add specific policy for the service role to create profiles
    - Ensure the handle_new_user trigger has appropriate permissions

  2. Purpose
    - Fix the "permission denied for table profiles" error during registration
    - Allow the Supabase Auth service to create user profiles on signup
*/

-- First add a policy to allow the service role to manage profiles
CREATE POLICY "Service role can manage all profiles" 
ON profiles
FOR ALL 
TO service_role
USING (true);

-- Ensure the trigger function can insert into profiles
ALTER FUNCTION handle_new_user() 
SECURITY DEFINER;

-- Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Finally add a policy for users to view their own profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
      ON profiles FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;