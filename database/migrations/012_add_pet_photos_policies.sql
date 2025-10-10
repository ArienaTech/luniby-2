-- Add storage policies for pet-photos in pet-owners bucket
-- Allows authenticated users to upload, view, and delete files under pet-photos/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete pet photos" ON storage.objects;

-- Allow authenticated users to upload pet photos
CREATE POLICY "Allow authenticated users to upload pet photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-owners' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'pet-photos'
);

-- Allow users to view pet photos
CREATE POLICY "Allow users to view pet photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pet-owners'
  AND (storage.foldername(name))[1] = 'pet-photos'
);

-- Allow authenticated users to delete pet photos
CREATE POLICY "Allow users to delete pet photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-owners' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'pet-photos'
);

-- Verification query (optional)
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE schemaname = 'storage' AND tablename = 'objects' 
--   AND (with_check LIKE '%pet-photos%' OR qual LIKE '%pet-photos%')
-- ORDER BY policyname;