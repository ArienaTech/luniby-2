-- Create Anna Wilson's account with pet_owner role
-- This ensures she has access to the /dashboard route

-- First, check if the user already exists in auth.users
-- If not, we'll need to create the account through the Supabase Auth UI or API
-- This script assumes the auth user already exists and we're just setting up the profile

-- Create or update Anna Wilson's profile with pet_owner role
INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    -- You'll need to replace this with Anna's actual user ID from auth.users
    -- This is a placeholder UUID - get the real one from Supabase Auth
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'anna-wilson@gmail.com',
    'Anna Wilson',
    'pet_owner',
    true,
    NOW(),
    NOW()
) 
ON CONFLICT (id) 
DO UPDATE SET 
    role = 'pet_owner',
    is_active = true,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();

-- Also update by email if the ID approach doesn't work
-- This handles cases where the profile might exist with a different structure
UPDATE public.profiles 
SET 
    role = 'pet_owner',
    is_active = true,
    updated_at = NOW()
WHERE email = 'anna-wilson@gmail.com';

-- If no profile exists, we need to create one
-- But first we need the auth user ID
-- You can get this by running: SELECT id FROM auth.users WHERE email = 'anna-wilson@gmail.com';

-- Verify the setup
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM public.profiles 
WHERE email = 'anna-wilson@gmail.com';

-- Log the account creation/update
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
SELECT 
    p.id,
    'pet_owner_account_setup',
    'user_profile',
    p.id::text,
    json_build_object(
        'email', p.email,
        'role', p.role,
        'action', 'Ensured Anna Wilson has pet_owner role for dashboard access'
    )
FROM public.profiles p
WHERE p.email = 'anna-wilson@gmail.com';

-- Instructions for manual setup if needed:
/*
MANUAL SETUP INSTRUCTIONS:

1. If Anna Wilson doesn't have an account yet:
   - Go to your Supabase project Auth settings
   - Create a new user with email: anna-wilson@gmail.com
   - Note down the user ID

2. Replace the placeholder UUID above with Anna's real user ID

3. Run this script in the Supabase SQL Editor

4. Verify Anna can access /dashboard by having her:
   - Sign in to the application
   - Navigate to /dashboard
   - Confirm she sees the pet owner dashboard interface

5. All users with role 'pet_owner' automatically get access to /dashboard
   - No additional role-based routing restrictions needed
   - The dashboard component handles role verification internally
*/