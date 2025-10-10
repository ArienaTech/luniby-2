-- Update trigger to capture ALL signup data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role := 'pet_owner'::user_role;
  user_location TEXT := '';
BEGIN
  -- Assign correct role based on provider_type
  IF NEW.raw_user_meta_data->>'user_type' = 'provider' THEN
    CASE NEW.raw_user_meta_data->>'provider_type'
      WHEN 'veterinarian' THEN user_role_value := 'veterinarian'::user_role;
      WHEN 'vet_nurse' THEN user_role_value := 'vet_nurse'::user_role;
      WHEN 'groomer' THEN user_role_value := 'groomer'::user_role;
      ELSE user_role_value := 'provider'::user_role;
    END CASE;
  END IF;

  -- Build location from address, city, country
  user_location := TRIM(CONCAT(
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    CASE WHEN NEW.raw_user_meta_data->>'address' IS NOT NULL AND NEW.raw_user_meta_data->>'city' IS NOT NULL THEN ', ' ELSE '' END,
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    CASE WHEN (NEW.raw_user_meta_data->>'address' IS NOT NULL OR NEW.raw_user_meta_data->>'city' IS NOT NULL) AND NEW.raw_user_meta_data->>'country' IS NOT NULL THEN ', ' ELSE '' END,
    COALESCE(NEW.raw_user_meta_data->>'country', '')
  ));

  -- Insert profile with ALL data
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    location,
    organization,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    user_location,
    NEW.raw_user_meta_data->>'business_name',
    user_role_value,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;