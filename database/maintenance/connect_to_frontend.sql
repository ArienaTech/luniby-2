-- CONNECT EXISTING DATA TO FRONTEND
-- This script creates the marketplace_listings view to display your existing data
-- Run this in your Supabase SQL Editor

-- ===============================
-- CREATE MARKETPLACE_LISTINGS VIEW
-- ===============================

SELECT '🔗 CONNECTING YOUR DATA TO FRONTEND...' as step;

-- Drop existing view if it exists
DROP VIEW IF EXISTS marketplace_listings;

-- Create marketplace_listings view that combines your existing services and products
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
  NULL::integer as stock_quantity,
  NULL::text as brand,
  NULL::text as sku,
  NULL::decimal as weight_kg,
  NULL::text as dimensions,
  NULL::text as age_group,
  NULL::text as pet_type,
  NULL::boolean as is_prescription
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
  -- Product specific fields
  NULL::integer as duration_minutes,
  NULL::text as location_type,
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

-- Grant permissions so the frontend can access it
GRANT SELECT ON marketplace_listings TO anon, authenticated;

SELECT '✅ MARKETPLACE VIEW CREATED!' as status;

-- ===============================
-- VERIFY CONNECTION
-- ===============================

SELECT '🔍 VERIFYING YOUR MARKETPLACE DATA...' as step;

-- Show what will appear in the marketplace
SELECT 
    'Total listings in marketplace:' as metric,
    COUNT(*) as count
FROM marketplace_listings;

-- Show breakdown by type
SELECT 
    listing_type,
    COUNT(*) as count
FROM marketplace_listings
GROUP BY listing_type;

-- Show sample listings that will appear on website
SELECT 
    listing_type,
    name,
    provider_name,
    city,
    category,
    price
FROM marketplace_listings
ORDER BY listing_type, price
LIMIT 10;

SELECT '🎉 SUCCESS! Your data is now connected to the frontend!' as result;
SELECT '🌐 Visit /marketplace on your website to see your listings!' as action;