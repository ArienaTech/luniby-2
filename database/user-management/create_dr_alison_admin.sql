-- Admin Setup for Dr. Alison Pickering
-- Email: dr.alison@luniby.com
-- Password: FutureWealth2026$
-- Name: Dr. Alison Pickering
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
WHERE email = 'dr.alison@luniby.com';

-- Step 2: Create user if doesn't exist, or update if exists
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
    'dr.alison@luniby.com',
    crypt('FutureWealth2026$', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "admin", "full_name": "Dr. Alison Pickering"}'::jsonb
) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now();

-- Step 3: Create/update profile in profiles table
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    'Dr. Alison Pickering', 
    'admin'::user_role
FROM auth.users 
WHERE email = 'dr.alison@luniby.com'
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

-- Step 4: Verify the final result
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data,
    p.full_name,
    p.role,
    p.created_at,
    p.updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'dr.alison@luniby.com';

-- Alternative Dashboard Method:
-- If you prefer using the Supabase Dashboard:
-- 1. Go to: https://supabase.com/dashboard
-- 2. Select project: wagrmmbkukwblfpfxxcb
-- 3. Navigate to: Authentication > Users
-- 4. Click "Add user" or find existing user: dr.alison@luniby.com
-- 5. Set email: dr.alison@luniby.com
-- 6. Set password: FutureWealth2026$
-- 7. In "User Metadata" add: {"role": "admin", "full_name": "Dr. Alison Pickering"}
-- 8. Save changes
-- 9. Then update the profiles table manually or run Step 3 above