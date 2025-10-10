-- Quick Fix for sara_lee123@gmail.com - Make them a veterinarian
-- Run this in your Supabase SQL Editor step by step

-- Step 1: Check what role they currently have
SELECT email, role FROM profiles WHERE email = 'sara_lee123@gmail.com';

-- Step 2: Update their role to veterinarian
UPDATE profiles 
SET role = 'veterinarian' 
WHERE email = 'sara_lee123@gmail.com';

-- Step 3: Verify the change
SELECT email, role FROM profiles WHERE email = 'sara_lee123@gmail.com';

-- Step 4: If the above didn't work, the user might not exist in profiles
-- Run this instead:
/*
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'sara_lee123@gmail.com',
    'veterinarian',
    'Sara Lee',
    NOW(),
    NOW()
);
*/