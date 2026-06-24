-- Create admin auth user (run in Supabase SQL editor)
-- Note: Supabase auth users must be created via the dashboard or auth API
-- This script sets up the profile after the auth user is created

INSERT INTO profiles (
  id,                    -- paste the UUID from Supabase Auth after creating the user
  full_name,
  phone,
  plan,
  plan_expires_at,
  onboarding_completed
) VALUES (
  '00000000-0000-0000-0000-000000000001',  -- replace with actual auth UUID
  'Nudge Admin',
  '+910000000000',
  'agency',
  '2099-12-31 23:59:59+00',
  true
) ON CONFLICT (id) DO UPDATE SET
  plan = 'agency',
  plan_expires_at = '2099-12-31 23:59:59+00';

-- Admin bypass flag in a separate table
INSERT INTO admin_users (user_id, is_admin)
VALUES ('00000000-0000-0000-0000-000000000001', true)
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;
