-- Add storage policies for vet-reports in pet-owners bucket
-- Allows authenticated users to upload, view, and delete files under vet-reports/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload vet reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view vet reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete vet reports" ON storage.objects;

-- Allow authenticated users to upload vet reports
CREATE POLICY "Allow authenticated users to upload vet reports" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-owners' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'vet-reports'
);

-- Allow users to view vet reports
CREATE POLICY "Allow users to view vet reports" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pet-owners'
  AND (storage.foldername(name))[1] = 'vet-reports'
);

-- Allow authenticated users to delete vet reports
CREATE POLICY "Allow users to delete vet reports" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-owners' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'vet-reports'
);