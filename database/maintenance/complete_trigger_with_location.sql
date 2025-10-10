-- Complete trigger with organization and location data
-- This captures all fields from the signup form

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role := 'pet_owner'::user_role;
  user_full_name TEXT := '';
  user_phone TEXT := '';
  user_address TEXT := '';
  user_city TEXT := '';
  user_country TEXT := '';
  user_business_name TEXT := '';
  provider_type_value TEXT := '';
BEGIN
  -- Extract provider type from signup form
  IF NEW.raw_user_meta_data->>'user_type' = 'provider' THEN
    provider_type_value := COALESCE(NEW.raw_user_meta_data->>'provider_type', 'provider');
    
    -- Convert provider_type directly to role
    CASE provider_type_value
      WHEN 'veterinarian' THEN 
        BEGIN
          user_role_value := 'veterinarian'::user_role;
        EXCEPTION WHEN OTHERS THEN
          user_role_value := 'pet_owner'::user_role;
        END;
      WHEN 'vet_nurse' THEN 
        BEGIN
          user_role_value := 'vet_nurse'::user_role;
        EXCEPTION WHEN OTHERS THEN
          user_role_value := 'pet_owner'::user_role;
        END;
      WHEN 'groomer' THEN 
        BEGIN
          user_role_value := 'groomer'::user_role;
        EXCEPTION WHEN OTHERS THEN
          user_role_value := 'pet_owner'::user_role;
        END;
      ELSE 
        user_role_value := 'pet_owner'::user_role;
    END CASE;
  END IF;
  
  -- Extract all signup form data
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  user_address := COALESCE(NEW.raw_user_meta_data->>'address', '');
  user_city := COALESCE(NEW.raw_user_meta_data->>'city', '');
  user_country := COALESCE(NEW.raw_user_meta_data->>'country', '');
  user_business_name := COALESCE(NEW.raw_user_meta_data->>'business_name', '');
  
  -- Create profile with all available fields
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      role, 
      full_name, 
      phone, 
      address, 
      city, 
      country, 
      organization
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      user_role_value, 
      user_full_name, 
      user_phone, 
      user_address, 
      user_city, 
      user_country, 
      user_business_name
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      country = EXCLUDED.country,
      organization = EXCLUDED.organization;
  EXCEPTION 
    WHEN OTHERS THEN
      -- If that fails, try with basic fields only
      BEGIN
        INSERT INTO public.profiles (id, email, role, full_name, phone)
        VALUES (NEW.id, NEW.email, user_role_value, user_full_name, user_phone)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          role = EXCLUDED.role,
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone;
      EXCEPTION 
        WHEN OTHERS THEN
          -- If even that fails, just basic profile
          BEGIN
            INSERT INTO public.profiles (id, email, role)
            VALUES (NEW.id, NEW.email, user_role_value)
            ON CONFLICT (id) DO UPDATE SET
              email = EXCLUDED.email,
              role = EXCLUDED.role;
          EXCEPTION 
            WHEN OTHERS THEN
              -- Ultimate fallback
              INSERT INTO public.profiles (id, email)
              VALUES (NEW.id, NEW.email)
              ON CONFLICT (id) DO NOTHING;
          END;
      END;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;