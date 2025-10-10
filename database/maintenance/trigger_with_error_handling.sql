-- Trigger with error handling to debug issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role := 'pet_owner'::user_role;
BEGIN
  -- Try to assign role, but don't fail if role doesn't exist
  BEGIN
    IF NEW.raw_user_meta_data->>'user_type' = 'provider' THEN
      CASE NEW.raw_user_meta_data->>'provider_type'
        WHEN 'veterinarian' THEN user_role_value := 'veterinarian'::user_role;
        WHEN 'vet_nurse' THEN user_role_value := 'vet_nurse'::user_role;
        WHEN 'groomer' THEN user_role_value := 'groomer'::user_role;
        ELSE user_role_value := 'provider'::user_role;
      END CASE;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- If role assignment fails, use pet_owner
    user_role_value := 'pet_owner'::user_role;
  END;

  -- Try full insert first
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      role,
      full_name, 
      phone, 
      location, 
      organization,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      user_role_value,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'phone',
      TRIM(CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'address', ''),
        CASE WHEN NEW.raw_user_meta_data->>'address' IS NOT NULL AND NEW.raw_user_meta_data->>'city' IS NOT NULL THEN ', ' ELSE '' END,
        COALESCE(NEW.raw_user_meta_data->>'city', ''),
        CASE WHEN (NEW.raw_user_meta_data->>'address' IS NOT NULL OR NEW.raw_user_meta_data->>'city' IS NOT NULL) AND NEW.raw_user_meta_data->>'country' IS NOT NULL THEN ', ' ELSE '' END,
        COALESCE(NEW.raw_user_meta_data->>'country', '')
      )),
      NEW.raw_user_meta_data->>'business_name',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      location = EXCLUDED.location,
      organization = EXCLUDED.organization,
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- If full insert fails, try minimal insert
    BEGIN
      INSERT INTO public.profiles (id, email, role)
      VALUES (NEW.id, NEW.email, user_role_value)
      ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
    EXCEPTION WHEN OTHERS THEN
      -- If even minimal fails, try absolute basic
      INSERT INTO public.profiles (id, email)
      VALUES (NEW.id, NEW.email)
      ON CONFLICT (id) DO NOTHING;
    END;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;