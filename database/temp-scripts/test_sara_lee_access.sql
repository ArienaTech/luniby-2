-- Test script to verify sara_lee123@gmail.com access
-- Run this in your Supabase SQL Editor

-- Step 1: Verify the user exists and has the correct role
SELECT 
    'Profile Check' as test_type,
    id,
    email,
    role,
    full_name,
    created_at
FROM profiles 
WHERE email = 'sara_lee123@gmail.com';

-- Step 2: Check if there's a provider record
SELECT 
    'Provider Check' as test_type,
    id,
    email,
    provider_type,
    verified,
    is_active
FROM providers 
WHERE email = 'sara_lee123@gmail.com';

-- Step 3: Check auth.users table
SELECT 
    'Auth Check' as test_type,
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'sara_lee123@gmail.com';

-- Step 4: Test role validation logic
-- This simulates what the Security.checkRole function does
WITH user_role AS (
    SELECT 
        au.id as user_id,
        au.email,
        p.role
    FROM auth.users au
    LEFT JOIN profiles p ON au.id = p.id
    WHERE au.email = 'sara_lee123@gmail.com'
)
SELECT 
    'Role Validation Test' as test_type,
    user_id,
    email,
    role,
    CASE 
        WHEN role = 'veterinarian' THEN '✅ Valid veterinarian role'
        WHEN role = 'vet_nurse' THEN '✅ Valid vet_nurse role'
        WHEN role IS NULL THEN '❌ No role assigned'
        ELSE '❌ Invalid role: ' || role
    END as role_status,
    CASE 
        WHEN role IN ('vet_nurse', 'veterinarian') THEN '✅ Can access veterinarian dashboard'
        ELSE '❌ Cannot access veterinarian dashboard'
    END as access_status
FROM user_role;