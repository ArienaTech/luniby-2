-- Fix Cameron Rodriguez groomer role setup
-- Run this in your Supabase SQL Editor

-- Step 1: Check current user data
SELECT 
    'Current Profile Data' as info,
    id,
    email,
    role,
    full_name,
    created_at
FROM auth.users 
WHERE email = 'cameron.rodriguez303@gmail.com';

-- Step 2: Check profiles table
SELECT 
    'Profile Table Data' as info,
    id,
    role,
    full_name,
    phone,
    location
FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'cameron.rodriguez303@gmail.com');

-- Step 3: Check providers table
SELECT 
    'Provider Table Data' as info,
    id,
    user_id,
    provider_type,
    business_name,
    created_at
FROM providers 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'cameron.rodriguez303@gmail.com');

-- Step 4: If user exists but doesn't have provider role, update profile
UPDATE profiles 
SET role = 'provider',
    updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'cameron.rodriguez303@gmail.com')
  AND role != 'provider';

-- Step 5: If provider record doesn't exist, create it
INSERT INTO providers (
    user_id,
    provider_type,
    business_name,
    created_at,
    updated_at
)
SELECT 
    u.id,
    'groomer',
    'Cameron Rodriguez Grooming',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'cameron.rodriguez303@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM providers p WHERE p.user_id = u.id
  );

-- Step 6: If provider exists but wrong type, update it
UPDATE providers 
SET provider_type = 'groomer',
    updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'cameron.rodriguez303@gmail.com')
  AND provider_type != 'groomer';

-- Step 7: Verify final state
SELECT 
    'Final Verification' as info,
    u.email,
    p.role as profile_role,
    pr.provider_type,
    pr.business_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN providers pr ON u.id = pr.user_id
WHERE u.email = 'cameron.rodriguez303@gmail.com';