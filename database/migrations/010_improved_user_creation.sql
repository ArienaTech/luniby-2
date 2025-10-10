-- Improved User Creation Migration
-- This migration updates the handle_new_user function to better handle user metadata and provider information

-- Update the handle_new_user function to extract more information from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
  user_phone TEXT;
  user_organization TEXT;
BEGIN
  -- Determine role based on user_type in metadata
  CASE COALESCE(new.raw_user_meta_data->>'user_type', 'pet_owner')
    WHEN 'provider' THEN user_role_value := 'provider';
    WHEN 'admin' THEN user_role_value := 'admin';
    WHEN 'support' THEN user_role_value := 'support';
    WHEN 'pet_owner' THEN user_role_value := 'pet_owner';
    WHEN 'customer' THEN user_role_value := 'pet_owner'; -- fallback for old data
    ELSE user_role_value := 'pet_owner';
  END CASE;

  -- Extract additional information from metadata if available
  user_phone := new.raw_user_meta_data->>'phone';
  user_organization := new.raw_user_meta_data->>'organization';

  -- Insert or update the profile
  INSERT INTO public.profiles (id, email, full_name, role, phone, organization)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    user_role_value,
    user_phone,
    user_organization
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    organization = COALESCE(EXCLUDED.organization, profiles.organization),
    updated_at = TIMEZONE('utc'::text, NOW());

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update provider profile information
CREATE OR REPLACE FUNCTION public.update_provider_profile(
  user_id UUID,
  provider_phone TEXT DEFAULT NULL,
  provider_organization TEXT DEFAULT NULL,
  provider_type TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update the profiles table
  UPDATE profiles 
  SET 
    phone = COALESCE(provider_phone, phone),
    organization = COALESCE(provider_organization, organization),
    updated_at = TIMEZONE('utc'::text, NOW())
  WHERE id = user_id;

  -- Log the profile update
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (
    user_id,
    'provider_profile_updated', 
    'profile',
    user_id::TEXT,
    jsonb_build_object(
      'phone', provider_phone,
      'organization', provider_organization,
      'provider_type', provider_type
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get complete user profile information
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role user_role,
  phone TEXT,
  organization TEXT,
  avatar_url TEXT,
  is_active BOOLEAN,
  provider_type TEXT,
  provider_verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.phone,
    p.organization,
    p.avatar_url,
    p.is_active,
    pr.provider_type,
    pr.verified as provider_verified,
    p.created_at,
    p.updated_at
  FROM profiles p
  LEFT JOIN providers pr ON p.email = pr.email
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_provider_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;