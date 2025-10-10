-- Fix Pet Owner Profile Creation Issue
-- This script ensures the correct trigger function is deployed that properly handles user_type metadata
-- Updated to match the actual profiles table schema

-- Drop the existing trigger to recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the handle_new_user function with proper user_type handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
  user_phone TEXT;
  user_organization TEXT;
  user_type_from_meta TEXT;
  user_full_name TEXT;
BEGIN
  -- Log the trigger execution for debugging
  RAISE LOG 'handle_new_user triggered for user: %', NEW.email;
  
  -- Get the user_type from metadata
  user_type_from_meta := COALESCE(NEW.raw_user_meta_data->>'user_type', 'pet_owner');
  
  -- Determine role based on user_type in metadata
  -- Pet owner signup sends: user_type: 'pet_owner'  
  -- Provider signup sends: user_type: 'veterinarian', 'vet_nurse', 'groomer', etc.
  CASE user_type_from_meta
    WHEN 'pet_owner' THEN user_role_value := 'pet_owner';
    WHEN 'customer' THEN user_role_value := 'pet_owner'; -- fallback for old data
    -- Provider types from ProviderSignUp.js providerTypes array
    WHEN 'veterinarian' THEN user_role_value := 'provider';
    WHEN 'vet_nurse' THEN user_role_value := 'provider';
    WHEN 'groomer' THEN user_role_value := 'provider';
    WHEN 'trainer' THEN user_role_value := 'provider';
    WHEN 'breeder' THEN user_role_value := 'provider';
    WHEN 'nutritionist' THEN user_role_value := 'provider';
    WHEN 'pet_business' THEN user_role_value := 'provider';
    WHEN 'holistic_care' THEN user_role_value := 'provider';
    -- Generic provider type (if used)
    WHEN 'provider' THEN user_role_value := 'provider';
    -- Admin roles
    WHEN 'admin' THEN user_role_value := 'admin';
    WHEN 'support' THEN user_role_value := 'support';
    -- Default fallback
    ELSE user_role_value := 'pet_owner';
  END CASE;

  -- Extract additional information from metadata if available
  user_phone := NEW.raw_user_meta_data->>'phone';
  user_organization := NEW.raw_user_meta_data->>'business_name';
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    TRIM(CONCAT(
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )),
    NEW.email
  );

  -- Insert or update the profile (using only columns that exist in the table)
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      role, 
      phone, 
      organization,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      user_full_name,
      user_role_value,
      user_phone,
      user_organization,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      role = EXCLUDED.role,
      phone = COALESCE(EXCLUDED.phone, profiles.phone),
      organization = COALESCE(EXCLUDED.organization, profiles.organization),
      updated_at = NOW();

    RAISE LOG 'Profile created/updated successfully for user: % with role: %', NEW.email, user_role_value;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth creation
    RAISE LOG 'Error creating profile for user %: % (SQLSTATE: %)', NEW.email, SQLERRM, SQLSTATE;
    
    -- Try a minimal insert as fallback
    BEGIN
      INSERT INTO public.profiles (id, email, role, created_at, updated_at)
      VALUES (NEW.id, NEW.email, 'pet_owner'::user_role, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
      
      RAISE LOG 'Fallback profile created for user: %', NEW.email;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Critical error in handle_new_user fallback for %: %', NEW.email, SQLERRM;
      -- Don't re-raise - let the auth user be created even if profile fails
    END;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;