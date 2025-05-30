/*
  # Create Authentication Schema

  1. New Tables
    - auth.users: Stores user accounts with email and password
    - auth.sessions: Manages user sessions
    - auth.refresh_tokens: Handles token refresh
    - auth.identities: Stores OAuth identities

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policy for user management

  3. Changes
    - Create auth schema
    - Set up basic authentication tables
    - Configure auth settings
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table
DO $$ BEGIN
  CREATE TYPE auth.aal_level AS ENUM ('aal1', 'aal2', 'aal3');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id uuid,
  email text UNIQUE,
  encrypted_password text,
  email_confirmed_at timestamptz DEFAULT now(),
  invited_at timestamptz DEFAULT now(),
  confirmation_token text,
  confirmation_sent_at timestamptz,
  recovery_token text,
  recovery_sent_at timestamptz,
  email_change_token_new text,
  email_change text,
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz DEFAULT now(),
  raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  is_super_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  phone text,
  phone_confirmed_at timestamptz,
  phone_change text,
  phone_change_token text,
  phone_change_sent_at timestamptz,
  email_change_token_current text,
  email_change_confirm_status smallint DEFAULT 0,
  banned_until timestamptz,
  reauthentication_token text,
  reauthentication_sent_at timestamptz,
  is_sso_user boolean DEFAULT false,
  deleted_at timestamptz,
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create identities table
CREATE TABLE IF NOT EXISTS auth.identities (
  provider_id text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_data jsonb NOT NULL,
  provider text NOT NULL,
  last_sign_in_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  email text GENERATED ALWAYS AS (lower(identity_data->>'email')) STORED,
  CONSTRAINT identities_pkey PRIMARY KEY (provider_id, provider)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  factor_id uuid,
  aal aal_level DEFAULT 'aal1'::aal_level,
  not_after timestamptz
);

-- Create refresh tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  id bigserial PRIMARY KEY,
  token text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revoked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  parent text,
  session_id uuid REFERENCES auth.sessions(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public users are viewable by everyone" ON auth.users;
DROP POLICY IF EXISTS "Users can update own record" ON auth.users;
DROP POLICY IF EXISTS "Users can delete own record" ON auth.users;
DROP POLICY IF EXISTS "Public identities are viewable by everyone" ON auth.identities;
DROP POLICY IF EXISTS "Authenticated users can manage own identities" ON auth.identities;
DROP POLICY IF EXISTS "Users can view own sessions" ON auth.sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON auth.sessions;
DROP POLICY IF EXISTS "Users can view own refresh tokens" ON auth.refresh_tokens;
DROP POLICY IF EXISTS "Users can manage own refresh tokens" ON auth.refresh_tokens;

-- Create new policies with proper UUID casting
CREATE POLICY "auth_users_select" ON auth.users
  FOR SELECT USING (true);

CREATE POLICY "auth_users_update" ON auth.users
  FOR UPDATE USING (auth.uid()::uuid = id);

CREATE POLICY "auth_users_delete" ON auth.users
  FOR DELETE USING (auth.uid()::uuid = id);

CREATE POLICY "auth_identities_select" ON auth.identities
  FOR SELECT USING (true);

CREATE POLICY "auth_identities_manage" ON auth.identities
  FOR ALL USING (auth.uid()::uuid = user_id);

CREATE POLICY "auth_sessions_select" ON auth.sessions
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "auth_sessions_manage" ON auth.sessions
  FOR ALL USING (auth.uid()::uuid = user_id);

CREATE POLICY "auth_refresh_tokens_select" ON auth.refresh_tokens
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "auth_refresh_tokens_manage" ON auth.refresh_tokens
  FOR ALL USING (auth.uid()::uuid = user_id);