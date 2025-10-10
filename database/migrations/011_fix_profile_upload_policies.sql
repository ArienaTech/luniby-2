-- Fix profile upload RLS policies
-- This migration adds missing INSERT policy for profiles table and storage policies for profile photos

-- 1. Add INSERT policy for profiles table (for new user registration)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Add storage policies for profile-photos folder
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their profile photos" ON storage.objects;

-- Allow authenticated users to upload profile photos
CREATE POLICY "Allow authenticated users to upload profile photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-owners' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'profile-photos'
);

-- Allow authenticated users to view profile photos
CREATE POLICY "Allow users to view profile photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pet-owners'
  AND (storage.foldername(name))[1] = 'profile-photos'
);

-- Allow authenticated users to delete their own profile photos
CREATE POLICY "Allow users to delete their profile photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-owners' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'profile-photos'
);

-- 3. Verify policies are created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'objects') 
ORDER BY tablename, policyname;