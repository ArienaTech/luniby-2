-- Fix RLS policies for services table to allow public read access
-- Copy and paste this into your Supabase SQL Editor

-- 1. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read" ON services;
DROP POLICY IF EXISTS "Allow authenticated insert" ON services;

-- 2. Add a policy to allow public SELECT (read) access
CREATE POLICY "Allow public read" ON services 
FOR SELECT USING (true);

-- 3. Add a policy to allow authenticated INSERT (for adding data through dashboard)
CREATE POLICY "Allow authenticated insert" ON services 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Insert sample data (this should work now with the INSERT policy)
INSERT INTO services (title, price) VALUES 
('Professional Dog Walking & Pet Sitting - Auckland, NZ', 35),
('Mobile Veterinary Services - Sydney, AU', 120),
('Premium Pet Grooming Studio - Melbourne, AU', 85),
('Certified Dog Training Classes - Wellington, NZ', 65),
('Luxury Pet Boarding Facility - Brisbane, AU', 60),
('Registered Golden Retriever Breeder - Perth, AU', 1800),
('Mobile Pet Grooming Service - Christchurch, NZ', 70),
('Veterinary Nurse Home Visits - Adelaide, AU', 55),
('Pet Photography Services - Auckland, NZ', 150),
('Cat Sitting & Care - Sydney, AU', 40),
('Puppy Training Classes - Melbourne, AU', 80),
('Pet Transport Services - Wellington, NZ', 45),
('Emergency Pet Care - Auckland, NZ', 200),
('Exotic Pet Veterinarian - Sydney, AU', 180),
('Professional Pet Massage Therapy - Melbourne, AU', 90);

-- 5. Verify the data was inserted
SELECT COUNT(*) as total_services FROM services;
SELECT * FROM services LIMIT 5;