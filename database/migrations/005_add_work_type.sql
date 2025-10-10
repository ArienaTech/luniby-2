-- Add work_type column to providers table
-- This distinguishes between business owners and contractors/employees

ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS work_type TEXT DEFAULT 'independent' 
CHECK (work_type IN ('business_owner', 'independent', 'contractor'));

-- Add a comment to explain the column
COMMENT ON COLUMN providers.work_type IS 'Type of work arrangement: business_owner (owns practice/business), independent (freelance/mobile services), or contractor (works for someone else)';

-- Update business_name column to allow NULL for contractors
ALTER TABLE providers 
ALTER COLUMN business_name DROP NOT NULL;

-- Add a comment to explain that business_name can be null for contractors
COMMENT ON COLUMN providers.business_name IS 'Business name - required for business owners, null for contractors who work under personal name';

-- Update existing records to have work_type as independent (default preference)
UPDATE providers 
SET work_type = 'independent' 
WHERE work_type IS NULL;

-- Update the marketplace_listings view to include work_type
DROP VIEW IF EXISTS marketplace_listings;

CREATE VIEW marketplace_listings AS
SELECT 
  -- Common fields
  'service' as listing_type,
  s.id as listing_id,
  s.title as name,
  s.description,
  s.price as price,
  s.location as city,
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
  p.work_type,
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
  p.work_type,
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

-- Grant appropriate permissions
GRANT SELECT ON marketplace_listings TO anon, authenticated;