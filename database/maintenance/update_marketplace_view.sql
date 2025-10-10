-- Update marketplace_listings view to show PROVIDERS not individual services
-- This creates one listing per provider that links to their profile

DROP VIEW IF EXISTS marketplace_listings;

CREATE VIEW marketplace_listings AS
-- Individual services from services table (existing products/services)
SELECT 
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

-- Provider listings (one per provider, not per service)
SELECT 
  'provider' as listing_type,
  p.id as listing_id,
  COALESCE(p.business_name, p.name) as name,
  CASE 
    WHEN p.provider_type = 'vet_nurse' THEN 
      'Qualified veterinary nurse offering ' || 
      CASE 
        WHEN COUNT(pl.*) > 1 THEN CAST(COUNT(pl.*) AS text) || ' services'
        ELSE 'professional veterinary services'
      END ||
      CASE 
        WHEN MAX(pl.price_from) IS NOT NULL THEN ' from $' || MIN(pl.price_from)::text
        ELSE ''
      END
    ELSE COALESCE(p.bio, 'Professional services')
  END as description,
  COALESCE(MIN(pl.price_from), 0) as price,
  p.city as city,
  p.provider_type as category,
  p.provider_type as subcategory,
  COALESCE(p.profile_image_url, pl.image_url) as image_url,
  p.created_at,
  p.updated_at,
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
  30 as duration_minutes,
  'mobile' as location_type,
  NULL::integer as stock_quantity,
  NULL::text as brand,
  NULL::text as sku,
  NULL::decimal as weight_kg,
  NULL::text as dimensions,
  NULL::text as age_group,
  NULL::text as pet_type,
  NULL::boolean as is_prescription
FROM providers p
LEFT JOIN provider_listings pl ON p.email = pl.provider_email AND pl.active = true
WHERE p.is_active = true 
  AND p.verified = true
          AND (pl.id IS NOT NULL OR p.provider_type != 'vet_nurse') -- Only show veterinarians if they have active services
GROUP BY p.id, p.name, p.business_name, p.provider_type, p.email, p.phone, 
         p.address, p.city, p.country, p.verified, p.rating, p.reviews_count,
         p.profile_image_url, p.service_types, p.created_at, p.updated_at, p.bio

UNION ALL

-- Products (existing)
SELECT 
  'product' as listing_type,
  pr.id as listing_id,
  pr.name,
  pr.description,
  pr.price,
  p.city as city,
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

-- Grant necessary permissions
GRANT SELECT ON marketplace_listings TO anon;
GRANT SELECT ON marketplace_listings TO authenticated;