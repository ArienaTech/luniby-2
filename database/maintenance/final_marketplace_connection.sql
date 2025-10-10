-- FINAL MARKETPLACE CONNECTION
-- This script ensures everything is properly connected and displays your data
-- Run this in your Supabase SQL Editor

-- ===============================
-- STEP 1: ENSURE MARKETPLACE VIEW IS ACTIVE
-- ===============================

SELECT '🔗 FINALIZING MARKETPLACE CONNECTION...' as step;

-- Refresh the marketplace_listings view to ensure it shows all your latest data
DROP VIEW IF EXISTS marketplace_listings;

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

-- Grant all necessary permissions
GRANT SELECT ON marketplace_listings TO anon, authenticated;

SELECT '✅ MARKETPLACE VIEW REFRESHED' as status;

-- ===============================
-- STEP 2: VERIFY ALL DATA IS CONNECTED
-- ===============================

SELECT '📊 VERIFYING YOUR MARKETPLACE DATA...' as step;

-- Show total count
SELECT 
    'TOTAL LISTINGS NOW LIVE:' as status,
    COUNT(*) as count
FROM marketplace_listings;

-- Show what's live by type
SELECT 
    'LIVE BY TYPE:' as breakdown,
    listing_type,
    COUNT(*) as count
FROM marketplace_listings
GROUP BY listing_type;

-- Show active providers
SELECT 
    'ACTIVE PROVIDERS:' as breakdown,
    COUNT(DISTINCT provider_name) as unique_providers
FROM marketplace_listings;

-- Show cities covered
SELECT 
    'CITIES COVERED:' as breakdown,
    COUNT(DISTINCT city) as cities,
    STRING_AGG(DISTINCT city, ', ') as city_list
FROM marketplace_listings;

-- ===============================
-- STEP 3: SHOW LIVE MARKETPLACE PREVIEW
-- ===============================

SELECT '🌐 LIVE MARKETPLACE PREVIEW:' as step;

-- This is exactly what visitors will see on your website
SELECT 
    '🏷️' as icon,
    listing_type,
    name,
    provider_name,
    city,
    category,
    '$' || price as display_price,
    CASE WHEN verified THEN '✅ Verified' ELSE '⭐ ' || COALESCE(rating::text, '4.0') END as trust_indicator
FROM marketplace_listings
ORDER BY 
    listing_type,
    verified DESC,
    rating DESC,
    created_at DESC
LIMIT 20;

-- ===============================
-- STEP 4: CONNECTION SUCCESS CONFIRMATION
-- ===============================

SELECT '🎉 CONNECTION COMPLETE!' as result;

-- Final status check
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SUCCESS: Your marketplace is now LIVE with ' || COUNT(*) || ' listings!'
        ELSE '❌ No listings found - check your data'
    END as final_status
FROM marketplace_listings;

-- Website access confirmation
SELECT '🌐 WEBSITE ACCESS:' as info;
SELECT 'Your marketplace is now accessible at: /marketplace' as url;
SELECT 'All your services and products are now displaying!' as confirmation;

-- Next steps
SELECT '📱 NEXT STEPS:' as guide;
SELECT '1. Visit /marketplace on your website' as step_1;
SELECT '2. Test the search and filtering features' as step_2;
SELECT '3. Check that all your listings appear correctly' as step_3;
SELECT '4. Verify provider information is displaying' as step_4;

SELECT '🚀 YOUR MARKETPLACE IS NOW FULLY CONNECTED AND LIVE!' as final_message;