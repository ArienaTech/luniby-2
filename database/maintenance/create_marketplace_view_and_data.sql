-- CREATE MARKETPLACE VIEW AND POPULATE DATA
-- This script creates the marketplace_listings view and ensures proper relationships
-- Run this in your Supabase SQL Editor

-- ===============================
-- STEP 1: CHECK EXISTING DATA
-- ===============================

SELECT '🔍 CHECKING EXISTING DATA...' as step;

-- Check what tables exist and their data
SELECT 'Services count:' as check, COUNT(*) as count FROM services;
SELECT 'Products count:' as check, COUNT(*) as count FROM products;
SELECT 'Providers count:' as check, COUNT(*) as count FROM providers;

-- ===============================
-- STEP 2: CREATE DEFAULT PROVIDERS IF NEEDED
-- ===============================

SELECT '👥 ENSURING PROVIDERS EXIST...' as step;

-- Create providers table if it doesn't exist (based on the schema we saw earlier)
CREATE TABLE IF NOT EXISTS providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    provider_type TEXT NOT NULL DEFAULT 'veterinarian',
    business_name TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Australia',
    bio TEXT,
    offers_services BOOLEAN DEFAULT true,
    offers_products BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.00,
    reviews_count INTEGER DEFAULT 0,
    profile_image_url TEXT,
    service_types TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample providers if none exist
INSERT INTO providers (
    id, name, email, phone, provider_type, business_name, address, city, country,
    bio, offers_services, offers_products, verified, is_active, featured, rating, reviews_count, service_types
) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Dr. Sarah Johnson', 'sarah@pawsvet.com.au', '+61-2-9876-5432', 'veterinarian', 'Paws Veterinary Clinic', '123 Pet Street', 'Sydney', 'Australia', 'Experienced veterinarian with 10+ years treating dogs, cats, and exotic pets.', true, true, true, true, true, 4.9, 127, ARRAY['Veterinary', 'Emergency Care']
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE email = 'sarah@pawsvet.com.au')

UNION ALL

SELECT 
    '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Emma Wilson', 'emma@pawsandclaws.com.au', '+61-3-8765-4321', 'groomer', 'Paws & Claws Grooming', '789 Grooming Lane', 'Melbourne', 'Australia', 'Professional pet groomer specializing in breed-specific cuts.', true, true, true, true, true, 4.7, 156, ARRAY['Pet Grooming']
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE email = 'emma@pawsandclaws.com.au')

UNION ALL

SELECT 
    '550e8400-e29b-41d4-a716-446655440003'::uuid, 'Pet Paradise Store', 'info@petparadise.com.au', '+61-8-456-7890', 'pet_store', 'Pet Paradise Supplies', '147 Pet Plaza', 'Perth', 'Australia', 'Premium pet supplies and accessories store.', false, true, true, true, false, 4.5, 234, ARRAY['Pet Supplies']
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE email = 'info@petparadise.com.au')

UNION ALL

SELECT 
    '550e8400-e29b-41d4-a716-446655440004'::uuid, 'Lisa Anderson', 'lisa@caninetraining.co.nz', '+64-4-234-5678', 'trainer', 'Canine Training Academy', '654 Training Road', 'Wellington', 'New Zealand', 'Certified dog trainer specializing in positive reinforcement.', true, false, true, true, true, 4.9, 203, ARRAY['Pet Training']
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE email = 'lisa@caninetraining.co.nz')

UNION ALL

SELECT 
    '550e8400-e29b-41d4-a716-446655440005'::uuid, 'Happy Tails Resort', 'bookings@happytails.com.au', '+61-7-345-6789', 'boarding', 'Happy Tails Pet Resort', '987 Resort Drive', 'Brisbane', 'Australia', 'Luxury pet boarding with individual suites and 24/7 care.', true, true, true, true, true, 4.8, 92, ARRAY['Pet Boarding']
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE email = 'bookings@happytails.com.au');

SELECT '✅ Providers created/verified' as status;

-- ===============================
-- STEP 3: UPDATE EXISTING SERVICES AND PRODUCTS WITH PROVIDER RELATIONSHIPS
-- ===============================

SELECT '🔗 LINKING EXISTING DATA TO PROVIDERS...' as step;

-- Update services to have proper provider_id if they don't already
UPDATE services 
SET provider_id = (
    CASE 
        WHEN title ILIKE '%vet%' OR title ILIKE '%veterinary%' THEN '550e8400-e29b-41d4-a716-446655440001'::uuid
        WHEN title ILIKE '%groom%' THEN '550e8400-e29b-41d4-a716-446655440002'::uuid
        WHEN title ILIKE '%train%' THEN '550e8400-e29b-41d4-a716-446655440004'::uuid
        WHEN title ILIKE '%board%' THEN '550e8400-e29b-41d4-a716-446655440005'::uuid
        ELSE '550e8400-e29b-41d4-a716-446655440001'::uuid -- Default to vet
    END
)
WHERE provider_id IS NULL OR provider_id NOT IN (SELECT id FROM providers);

-- Update products to have proper provider_id if they don't already
UPDATE products 
SET provider_id = (
    CASE 
        WHEN name ILIKE '%food%' OR name ILIKE '%treat%' OR name ILIKE '%toy%' THEN '550e8400-e29b-41d4-a716-446655440003'::uuid
        WHEN name ILIKE '%groom%' OR name ILIKE '%shampoo%' THEN '550e8400-e29b-41d4-a716-446655440002'::uuid
        WHEN name ILIKE '%medical%' OR name ILIKE '%health%' THEN '550e8400-e29b-41d4-a716-446655440001'::uuid
        ELSE '550e8400-e29b-41d4-a716-446655440003'::uuid -- Default to pet store
    END
)
WHERE provider_id IS NULL OR provider_id NOT IN (SELECT id FROM providers);

-- Ensure all records are active
UPDATE services SET is_active = true WHERE is_active IS NULL OR is_active = false;
UPDATE products SET is_active = true WHERE is_active IS NULL OR is_active = false;
UPDATE providers SET is_active = true WHERE is_active IS NULL OR is_active = false;

SELECT '✅ Existing data linked to providers' as status;

-- ===============================
-- STEP 4: CREATE THE MARKETPLACE_LISTINGS VIEW
-- ===============================

SELECT '👁️ CREATING MARKETPLACE_LISTINGS VIEW...' as step;

-- Drop existing view if it exists
DROP VIEW IF EXISTS marketplace_listings;

-- Create the marketplace_listings view that combines services and products
CREATE VIEW marketplace_listings AS
SELECT 
  -- Common fields
  'service' as listing_type,
  s.id as listing_id,
  s.title as name,
  s.description,
  s.price as price,
  p.city as city,
  s.service_type as category,
  s.service_type as subcategory,
  s.image_url,
  s.created_at,
  s.updated_at,
  -- Provider fields
  p.id as provider_id,
  p.name as provider_name,
  p.business_name,
  p.provider_type,
  p.email as provider_email,
  p.phone as provider_phone,
  p.address as provider_address,
  p.city as provider_city,
  p.country as provider_country,
  p.verified,
  p.rating,
  p.reviews_count,
  p.profile_image_url,
  p.service_types,
  -- Service specific fields
  s.duration_minutes,
  s.location_type,
  NULL as stock_quantity,
  NULL as brand,
  NULL as sku,
  NULL as weight_kg,
  NULL as dimensions,
  NULL as age_group,
  NULL as pet_type,
  NULL as is_prescription
FROM services s
JOIN providers p ON s.provider_id = p.id
WHERE s.is_active = true AND p.is_active = true

UNION ALL

SELECT 
  -- Common fields
  'product' as listing_type,
  pr.id as listing_id,
  pr.name,
  pr.description,
  pr.price,
  p.city,
  pr.category,
  pr.subcategory,
  pr.image_url,
  pr.created_at,
  pr.updated_at,
  -- Provider fields
  p.id as provider_id,
  p.name as provider_name,
  p.business_name,
  p.provider_type,
  p.email as provider_email,
  p.phone as provider_phone,
  p.address as provider_address,
  p.city as provider_city,
  p.country as provider_country,
  p.verified,
  p.rating,
  p.reviews_count,
  p.profile_image_url,
  p.service_types,
  -- Product specific fields (NULL for services)
  NULL as duration_minutes,
  NULL as location_type,
  pr.stock_quantity,
  pr.brand,
  pr.sku,
  pr.weight_kg,
  pr.dimensions,
  pr.age_group,
  pr.pet_type,
  pr.is_prescription
FROM products pr
JOIN providers p ON pr.provider_id = p.id
WHERE pr.is_active = true AND p.is_active = true;

-- Grant permissions on the view
GRANT SELECT ON marketplace_listings TO anon, authenticated;

SELECT '✅ Marketplace view created successfully' as status;

-- ===============================
-- STEP 5: VERIFY THE MARKETPLACE VIEW
-- ===============================

SELECT '🔍 VERIFICATION RESULTS' as step;

-- Count all records
SELECT 'Total services:' as metric, COUNT(*) as count FROM services WHERE is_active = true;
SELECT 'Total products:' as metric, COUNT(*) as count FROM products WHERE is_active = true;
SELECT 'Total providers:' as metric, COUNT(*) as count FROM providers WHERE is_active = true;
SELECT 'Total marketplace listings:' as metric, COUNT(*) as count FROM marketplace_listings;

-- Show breakdown by type
SELECT 'MARKETPLACE BREAKDOWN:' as section;
SELECT 
    listing_type,
    COUNT(*) as listings,
    MIN(price) as min_price,
    MAX(price) as max_price,
    ROUND(AVG(price)::NUMERIC, 2) as avg_price
FROM marketplace_listings 
GROUP BY listing_type;

-- Show sample listings
SELECT 'SAMPLE LISTINGS:' as section;
SELECT 
    listing_type,
    LEFT(name, 40) || '...' as name_preview,
    provider_name,
    city,
    price,
    category
FROM marketplace_listings 
ORDER BY listing_type, price
LIMIT 10;

-- Show providers and their listings
SELECT 'PROVIDERS WITH LISTING COUNTS:' as section;
SELECT 
    p.name as provider_name,
    p.city,
    p.provider_type,
    COUNT(ml.*) as total_listings,
    SUM(CASE WHEN ml.listing_type = 'service' THEN 1 ELSE 0 END) as services,
    SUM(CASE WHEN ml.listing_type = 'product' THEN 1 ELSE 0 END) as products
FROM providers p
LEFT JOIN marketplace_listings ml ON p.id = ml.provider_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.city, p.provider_type
ORDER BY total_listings DESC;

-- ===============================
-- STEP 6: SUCCESS MESSAGE
-- ===============================

SELECT '🎉 MARKETPLACE SETUP COMPLETE!' as result;
SELECT '✅ marketplace_listings view created with your existing data' as summary;
SELECT '🔗 All services and products now linked to providers' as relationships;
SELECT '🌐 Visit /marketplace to see your listings!' as action;
SELECT '📊 Use the verification queries above to see what was created' as info;