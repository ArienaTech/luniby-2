-- Simple Admin Setup for camille@luniby.com
-- Run this step by step in your Supabase SQL Editor
-- Project: wagrmmbkukwblfpfxxcb

-- Step 1: Check if user exists
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'camille@luniby.com';

-- Step 2: If user exists, update password
UPDATE auth.users 
SET encrypted_password = crypt('Passollie2025$', gen_salt('bf')),
    updated_at = now()
WHERE email = 'camille@luniby.com';

-- Step 3: Add admin role to user metadata
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
    updated_at = now()
WHERE email = 'camille@luniby.com';

-- Step 4: If user doesn't exist, create them manually
-- Run this only if Step 1 returned no results:

/*
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    (SELECT id FROM auth.instances LIMIT 1),
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'camille@luniby.com',
    crypt('Passollie2025$', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "admin"}'::jsonb
);
*/

-- Step 5: Verify the final result
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'camille@luniby.com';

-- Note: If you get permission errors, use the Dashboard method instead:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select project: wagrmmbkukwblfpfxxcb
-- 3. Navigate to Authentication > Users
-- 4. Find camille@luniby.com (or create if not exists)
-- 5. Click "..." > "Edit user"
-- 6. Set password to: Passollie2025$
-- 7. In "User Metadata" add: {"role": "admin"}
-- 8. Save changes