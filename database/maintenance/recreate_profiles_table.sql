-- Drop and recreate profiles table with exactly what we need

-- Step 1: Drop existing profiles table and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 2: Recreate profiles table with clean structure
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  organization TEXT,
  role user_role DEFAULT 'pet_owner'::user_role,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Create simple trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role := 'pet_owner'::user_role;
BEGIN
  -- Determine role from provider_type
  IF NEW.raw_user_meta_data->>'user_type' = 'provider' THEN
    CASE NEW.raw_user_meta_data->>'provider_type'
      WHEN 'veterinarian' THEN user_role_value := 'veterinarian'::user_role;
      WHEN 'vet_nurse' THEN user_role_value := 'vet_nurse'::user_role;
      WHEN 'groomer' THEN user_role_value := 'groomer'::user_role;
      ELSE user_role_value := 'provider'::user_role;
    END CASE;
  END IF;

  -- Insert profile with clean data
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
    TRIM(CONCAT(
      COALESCE(NEW.raw_user_meta_data->>'address', ''),
      CASE WHEN NEW.raw_user_meta_data->>'address' IS NOT NULL AND NEW.raw_user_meta_data->>'city' IS NOT NULL THEN ', ' ELSE '' END,
      COALESCE(NEW.raw_user_meta_data->>'city', ''),
      CASE WHEN (NEW.raw_user_meta_data->>'address' IS NOT NULL OR NEW.raw_user_meta_data->>'city' IS NOT NULL) AND NEW.raw_user_meta_data->>'country' IS NOT NULL THEN ', ' ELSE '' END,
      COALESCE(NEW.raw_user_meta_data->>'country', '')
    )),
    NEW.raw_user_meta_data->>'business_name',
    user_role_value,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 7: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;