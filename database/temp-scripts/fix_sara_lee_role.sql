-- Fix role for sara_lee123@gmail.com to make them a veterinarian
-- Run this in your Supabase SQL Editor
-- Project: wagrmmbkukwblfpfxxcb

-- Step 1: Check current user role
SELECT 
    id,
    email,
    role,
    full_name,
    created_at
FROM profiles 
WHERE email = 'sara_lee123@gmail.com';

-- Step 2: Update the user role to veterinarian
UPDATE profiles 
SET role = 'veterinarian'
WHERE email = 'sara_lee123@gmail.com';

-- Step 3: Verify the update
SELECT 
    id,
    email,
    role,
    full_name,
    created_at
FROM profiles 
WHERE email = 'sara_lee123@gmail.com';

-- Step 4: If the user doesn't exist in profiles, create them
-- (Uncomment and run this if Step 1 returns no results)
/*
INSERT INTO profiles (
    id,
    email,
    role,
    full_name,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'sara_lee123@gmail.com',
    'veterinarian',
    'Sara Lee',
    NOW(),
    NOW()
);
*/

-- Step 5: Also check if there's a provider record
SELECT 
    id,
    email,
    provider_type,
    verified,
    is_active
FROM providers 
WHERE email = 'sara_lee123@gmail.com';

-- Step 6: Create provider record if it doesn't exist
-- (Uncomment and run this if Step 5 returns no results)
/*
INSERT INTO providers (
    id,
    name,
    email,
    provider_type,
    verified,
    is_active,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM profiles WHERE email = 'sara_lee123@gmail.com'),
    'Sara Lee',
    'sara_lee123@gmail.com',
    'veterinarian',
    true,
    true,
    NOW(),
    NOW()
);
*/

-- Step 7: Final verification - check both tables
SELECT 
    'Profile' as table_name,
    id,
    email,
    role,
    full_name
FROM profiles 
WHERE email = 'sara_lee123@gmail.com'

UNION ALL

SELECT 
    'Provider' as table_name,
    id::text,
    email,
    provider_type as role,
    name as full_name
FROM providers 
WHERE email = 'sara_lee123@gmail.com';