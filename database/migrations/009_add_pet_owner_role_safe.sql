-- Safe Pet Owner Role Addition Migration
-- This migration adds the pet_owner role safely by handling PostgreSQL enum constraints
-- Run this AFTER running the enterprise RBAC migration (007_enterprise_rbac.sql)

-- Step 1: Add 'pet_owner' to the enum (this needs to be in its own transaction)
DO $$ 
BEGIN
    -- Only add if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pet_owner' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'pet_owner';
    END IF;
END $$;

-- IMPORTANT: The enum value addition above needs to be committed before we can use it
-- In Supabase SQL Editor, this happens automatically between statements
-- If you're running this in a transaction block, you need to commit here

-- Step 2: Update existing data and functions (run this AFTER the enum is committed)
-- This is in a separate DO block to ensure the enum value is available

DO $$ 
BEGIN
    -- Update existing 'customer' users to 'pet_owner' (if any exist)
    UPDATE profiles SET role = 'pet_owner' WHERE role = 'customer';
    
    -- Update the default role for new users in the profiles table
    ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'pet_owner';
END $$;

-- Step 3: Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    'pet_owner'  -- Default role for normal signups
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Update system settings with role descriptions
INSERT INTO system_settings (key, value, description) VALUES
('user_roles', '{
  "pet_owner": "Default role for pet owners who sign up normally",
  "provider": "Role for service providers in the marketplace", 
  "admin": "Full system administration access",
  "support": "Customer support team access"
}', 'User role definitions and descriptions')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- Step 5: Log the role update
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
VALUES (
  NULL,
  'pet_owner_role_added', 
  'system',
  'user_roles',
  '{"change": "Added pet_owner role as default, updated from customer role"}'
);