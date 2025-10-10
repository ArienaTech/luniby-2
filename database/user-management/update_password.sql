-- Password Update for amber_summer2000@gmail.com
-- Run this in your Supabase SQL Editor
-- Project: wagrmmbkukwblfpfxxcb

-- Method 1: Update password directly (requires admin access)
UPDATE auth.users 
SET encrypted_password = crypt('0001', gen_salt('bf'))
WHERE email = 'amber_summer2000@gmail.com';

-- Method 2: Alternative approach using auth.users table
-- This updates the password hash for the specific user
UPDATE auth.users 
SET encrypted_password = crypt('0001', gen_salt('bf')),
    updated_at = now()
WHERE email = 'amber_summer2000@gmail.com';

-- Verify the update (optional)
SELECT 
    id,
    email,
    encrypted_password,
    updated_at
FROM auth.users 
WHERE email = 'amber_summer2000@gmail.com';

-- Note: If you get permission errors, use the Dashboard method instead:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select project: wagrmmbkukwblfpfxxcb
-- 3. Navigate to Authentication > Users
-- 4. Find amber_summer2000@gmail.com
-- 5. Click "..." > "Reset password"
-- 6. Set new password to: 0001