-- Make camille@luniby.com an Admin User (Fixed Version)
-- Run this in your Supabase SQL Editor
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

-- Step 2: If user exists, update password and role
DO $$
BEGIN
    -- Check if user exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'camille@luniby.com') THEN
        -- Update existing user
        UPDATE auth.users 
        SET encrypted_password = crypt('Passollie2025$', gen_salt('bf')),
            raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
            updated_at = now()
        WHERE email = 'camille@luniby.com';
        
        RAISE NOTICE 'User camille@luniby.com updated successfully';
    ELSE
        -- Create new user
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
        
        RAISE NOTICE 'User camille@luniby.com created successfully';
    END IF;
END $$;

-- Step 3: Verify the final result
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'camille@luniby.com';

-- Alternative Method: Simple approach without ON CONFLICT
-- Uncomment and run this if the above method still has issues

/*
-- Method A: Try to update first, then insert if no rows affected
UPDATE auth.users 
SET encrypted_password = crypt('Passollie2025$', gen_salt('bf')),
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
    updated_at = now()
WHERE email = 'camille@luniby.com';

-- If no rows were updated, create the user
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
) 
SELECT 
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
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'camille@luniby.com'
);
*/