-- Data capture trigger - adds signup form data to the working basic structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role := 'pet_owner'::user_role;
  user_full_name TEXT := '';
  user_phone TEXT := '';
  user_location TEXT := '';
  user_organization TEXT := '';
BEGIN
  -- Extract role from provider type
  IF NEW.raw_user_meta_data->>'user_type' = 'provider' THEN
    CASE NEW.raw_user_meta_data->>'provider_type'
      WHEN 'veterinarian' THEN user_role_value := 'veterinarian'::user_role;
      WHEN 'vet_nurse' THEN user_role_value := 'vet_nurse'::user_role;
      WHEN 'groomer' THEN user_role_value := 'groomer'::user_role;
      ELSE user_role_value := 'provider'::user_role;
    END CASE;
  END IF;
  
  -- Extract signup form data
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  user_organization := COALESCE(NEW.raw_user_meta_data->>'business_name', '');
  
  -- Build location from address, city, country
  user_location := TRIM(CONCAT(
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    CASE WHEN NEW.raw_user_meta_data->>'address' IS NOT NULL AND NEW.raw_user_meta_data->>'city' IS NOT NULL THEN ', ' ELSE '' END,
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    CASE WHEN (NEW.raw_user_meta_data->>'address' IS NOT NULL OR NEW.raw_user_meta_data->>'city' IS NOT NULL) AND NEW.raw_user_meta_data->>'country' IS NOT NULL THEN ', ' ELSE '' END,
    COALESCE(NEW.raw_user_meta_data->>'country', '')
  ));
  
  -- Insert with all data (try full insert first)
  BEGIN
    INSERT INTO public.profiles (id, email, role, full_name, phone, location, organization)
    VALUES (NEW.id, NEW.email, user_role_value, user_full_name, user_phone, user_location, user_organization)
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      location = EXCLUDED.location,
      organization = EXCLUDED.organization;
  EXCEPTION WHEN OTHERS THEN
    -- If full insert fails, try without optional columns
    BEGIN
      INSERT INTO public.profiles (id, email, role, full_name, phone)
      VALUES (NEW.id, NEW.email, user_role_value, user_full_name, user_phone)
      ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone;
    EXCEPTION WHEN OTHERS THEN
      -- If that fails, use the working minimal version
      INSERT INTO public.profiles (id, email, role)
      VALUES (NEW.id, NEW.email, user_role_value)
      ON CONFLICT (id) DO NOTHING;
    END;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;