-- Fix profile upload RLS policies (SAFE VERSION)
-- This migration adds missing policies only if they don't already exist

-- 1. Add INSERT policy for profiles table (for new user registration)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Add storage policies for profile-photos folder ONLY
-- These are the missing policies that are causing the upload issue

-- Check if profile-photos policies exist, if not create them
DO $$
BEGIN
    -- Upload policy for profile-photos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to upload profile photos'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload profile photos" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'pet-owners' 
          AND auth.role() = 'authenticated'
          AND (storage.foldername(name))[1] = 'profile-photos'
        );
    END IF;

    -- View policy for profile-photos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow users to view profile photos'
    ) THEN
        CREATE POLICY "Allow users to view profile photos" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'pet-owners'
          AND (storage.foldername(name))[1] = 'profile-photos'
        );
    END IF;

    -- Delete policy for profile-photos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow users to delete their profile photos'
    ) THEN
        CREATE POLICY "Allow users to delete their profile photos" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'pet-owners' 
          AND auth.role() = 'authenticated'
          AND (storage.foldername(name))[1] = 'profile-photos'
        );
    END IF;
END
$$;

-- 3. Verify policies are created
SELECT 
  'PROFILES TABLE POLICIES' as section,
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

SELECT 
  'STORAGE POLICIES FOR PROFILE-PHOTOS' as section,
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (with_check LIKE '%profile-photos%' OR qual LIKE '%profile-photos%')
ORDER BY policyname;