-- Fix provider_listings table structure
-- This fixes the missing category column error

-- STEP 1: Drop the incomplete table if it exists
DROP TABLE IF EXISTS provider_listings CASCADE;

-- STEP 2: Create the complete provider_listings table with ALL columns
CREATE TABLE provider_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    service_type TEXT,
    price_from DECIMAL(10,2),
    price_to DECIMAL(10,2),
    location TEXT,
    provider_email TEXT NOT NULL,
    provider_name TEXT,
    provider_type TEXT,
    category TEXT,  -- This was missing!
    duration INTEGER,
    available_days TEXT,
    available_times TEXT,
    active BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Enable RLS
ALTER TABLE provider_listings ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create RLS policies
CREATE POLICY "Providers can view their own listings" ON provider_listings
    FOR SELECT USING (
        provider_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR provider_email = (SELECT email FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Providers can manage their own listings" ON provider_listings
    FOR ALL USING (
        provider_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR provider_email = (SELECT email FROM profiles WHERE id = auth.uid())
    );

-- STEP 5: Copy Emily's data from marketplace_listings to provider_listings
INSERT INTO provider_listings (
    title, description, service_type, price_from, price_to,
    location, provider_email, provider_name, provider_type,
    category, active, verified, rating
) 
SELECT 
    name as title,
    description,
    'consultation' as service_type,
    price as price_from,
    price as price_to,
    city as location,
    'emily@example.com' as provider_email,  -- Replace with Emily's actual email
    provider_name,
    'vet_nurse' as provider_type,
    category,  -- Now this column exists!
    true as active,
    verified,
    rating
FROM marketplace_listings
WHERE provider_name ILIKE '%emily%';

-- STEP 6: Add some sample veterinarian services for Emily
INSERT INTO provider_listings (
    title, description, service_type, price_from, price_to,
    location, provider_email, provider_name, provider_type,
    category, duration, available_days, available_times,
    active, verified, rating
) VALUES
(
    'Veterinarian Consultation',
    'Professional veterinary nurse consultation for pet health assessment and advice',
    'consultation',
    35.00,
    55.00,
    'Auckland, NZ',
    'emily@example.com',  -- Replace with Emily's actual email
    'Emily Summer',
    'vet_nurse',
    'Veterinary Care',
    30,
    'Monday,Tuesday,Wednesday,Thursday,Friday',
    '09:00-17:00',
    true,
    true,
    4.8
),
(
    'Pet Health Check',
    'Comprehensive health check and wellness assessment by qualified veterinarian',
    'health_check',
    40.00,
    60.00,
    'Auckland, NZ',
    'emily@example.com',  -- Replace with Emily's actual email
    'Emily Summer',
    'vet_nurse',
    'Veterinary Care',
    45,
    'Monday,Tuesday,Wednesday,Thursday,Friday',
    '09:00-17:00',
    true,
    true,
    4.9
),
(
    'Medication Administration',
    'Professional medication administration and monitoring for pets',
    'medication',
    25.00,
    35.00,
    'Auckland, NZ',
    'emily@example.com',  -- Replace with Emily's actual email
    'Emily Summer',
    'vet_nurse',
    'Veterinary Care',
    20,
    'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    '08:00-18:00',
    true,
    true,
    4.7
);

-- STEP 7: Verify the data was inserted
SELECT 
    id, title, provider_email, provider_name, category, active, verified
FROM provider_listings 
WHERE provider_name ILIKE '%emily%'
ORDER BY created_at DESC;