-- Fix for handle_new_user function to resolve "Database error saving new user"
-- This creates a robust function that matches your actual database schema

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
  user_phone TEXT;
  user_organization TEXT;
  user_full_name TEXT;
BEGIN
  -- Log the trigger execution for debugging
  RAISE LOG 'handle_new_user triggered for user: %', NEW.email;
  
  -- Safely extract user type from metadata with proper fallback
  user_role_value := CASE COALESCE(NEW.raw_user_meta_data->>'user_type', 'pet_owner')
    WHEN 'provider' THEN 'provider'::user_role
    WHEN 'admin' THEN 'admin'::user_role
    WHEN 'support' THEN 'support'::user_role
    WHEN 'pet_owner' THEN 'pet_owner'::user_role
    WHEN 'customer' THEN 'pet_owner'::user_role -- fallback for old data
    ELSE 'pet_owner'::user_role -- default fallback
  END;

  -- Extract additional information from metadata
  user_phone := NEW.raw_user_meta_data->>'phone';
  user_organization := NEW.raw_user_meta_data->>'organization';
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    CONCAT(NEW.raw_user_meta_data->>'first_name', ' ', NEW.raw_user_meta_data->>'last_name'),
    ''
  );

  -- Insert profile with proper error handling
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      first_name,
      last_name,
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
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      user_role_value,
      user_phone,
      user_organization,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
      last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
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

-- Recreate the trigger to ensure it's properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile when new auth user is created';