/*
  # Fix handle_new_user function to handle missing metadata

  1. Changes
    - Drop the existing trigger first
    - Drop the existing function
    - Create an updated version of the function that handles missing metadata
    - Recreate the trigger
*/

-- First drop the trigger that depends on the function
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    END IF;
END
$$;

-- Now drop the function
DROP FUNCTION IF EXISTS handle_new_user();

-- Create an updated version of the function that handles missing metadata
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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();