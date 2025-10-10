-- Marketplace Performance Optimization
-- This script adds indexes and optimizations for faster marketplace loading

-- Add indexes for better performance on marketplace queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_active_updated 
ON services (is_active, updated_at DESC) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_updated 
ON products (is_active, updated_at DESC) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_providers_active_city 
ON providers (is_active, city) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_category_price 
ON services (service_type, price) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_price 
ON products (category, price) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_providers_verified_rating 
ON providers (verified, rating DESC) WHERE is_active = true;

-- Create a materialized view for even better performance (optional - for high traffic)
-- This can be refreshed periodically instead of computing the union every time
CREATE MATERIALIZED VIEW IF NOT EXISTS marketplace_listings_fast AS
SELECT 
  -- Common fields
  'service' as listing_type,
  s.id as listing_id,
  s.title as name,
  s.description,
  s.price as price,
  p.city as city,
  s.service_type as category,
  s.image_url,
  s.updated_at,
  -- Provider fields (essential only)
  p.id as provider_id,
  p.name as provider_name,
  p.verified,
  p.rating,
  p.reviews_count,
  NULL::integer as stock_quantity
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
  pr.image_url,
  pr.updated_at,
  -- Provider fields (essential only)
  p.id as provider_id,
  p.name as provider_name,
  p.verified,
  p.rating,
  p.reviews_count,
  pr.stock_quantity
FROM products pr
JOIN providers p ON pr.provider_id = p.id
WHERE pr.is_active = true AND p.is_active = true;

-- Index the materialized view for fast lookups
CREATE INDEX IF NOT EXISTS idx_marketplace_fast_updated ON marketplace_listings_fast (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_fast_category ON marketplace_listings_fast (category);
CREATE INDEX IF NOT EXISTS idx_marketplace_fast_city ON marketplace_listings_fast (city);
CREATE INDEX IF NOT EXISTS idx_marketplace_fast_price ON marketplace_listings_fast (price);
CREATE INDEX IF NOT EXISTS idx_marketplace_fast_type ON marketplace_listings_fast (listing_type);

-- Grant permissions
GRANT SELECT ON marketplace_listings_fast TO anon, authenticated;

-- Function to refresh the materialized view (can be called periodically)
CREATE OR REPLACE FUNCTION refresh_marketplace_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY marketplace_listings_fast;
END;
$$ LANGUAGE plpgsql;

-- Create a function for server-side filtering to reduce client-side processing
CREATE OR REPLACE FUNCTION get_filtered_marketplace_listings(
  search_term TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  city_filter TEXT DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 12
)
RETURNS TABLE (
  listing_type TEXT,
  listing_id INTEGER,
  name TEXT,
  description TEXT,
  price DECIMAL,
  city TEXT,
  category TEXT,
  image_url TEXT,
  provider_id INTEGER,
  provider_name TEXT,
  verified BOOLEAN,
  rating DECIMAL,
  reviews_count INTEGER,
  stock_quantity INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) AS $$
DECLARE
  offset_value INTEGER;
BEGIN
  offset_value := (page_number - 1) * page_size;
  
  RETURN QUERY
  WITH filtered_listings AS (
    SELECT 
      ml.*,
      COUNT(*) OVER() as total_count
    FROM marketplace_listings_fast ml
    WHERE 
      (search_term IS NULL OR (
        LOWER(ml.name) LIKE LOWER('%' || search_term || '%') OR
        LOWER(ml.description) LIKE LOWER('%' || search_term || '%') OR
        LOWER(ml.provider_name) LIKE LOWER('%' || search_term || '%') OR
        LOWER(ml.category) LIKE LOWER('%' || search_term || '%')
      ))
      AND (category_filter IS NULL OR (
        (category_filter = 'Products' AND ml.listing_type = 'product') OR
        (category_filter = 'Veterinary' AND ml.category IN ('Veterinary', 'Veterinarian')) OR
        (category_filter = 'Groomers' AND ml.category = 'Pet Grooming') OR
        (category_filter = 'Trainers' AND ml.category = 'Pet Training') OR
        (category_filter = 'Breeders' AND ml.category = 'Pet Breeding') OR
        (category_filter = 'Nutritionists' AND ml.category = 'Nutritionists') OR
        (category_filter = 'Holistic Care' AND ml.category = 'Holistic Care')
      ))
      AND (city_filter IS NULL OR LOWER(ml.city) LIKE LOWER('%' || city_filter || '%'))
      AND (min_price IS NULL OR ml.price >= min_price)
      AND (max_price IS NULL OR ml.price <= max_price)
    ORDER BY ml.updated_at DESC
    LIMIT page_size OFFSET offset_value
  )
  SELECT 
    fl.listing_type,
    fl.listing_id,
    fl.name,
    fl.description,
    fl.price,
    fl.city,
    fl.category,
    fl.image_url,
    fl.provider_id,
    fl.provider_name,
    fl.verified,
    fl.rating,
    fl.reviews_count,
    fl.stock_quantity,
    fl.updated_at,
    fl.total_count
  FROM filtered_listings fl;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_filtered_marketplace_listings TO anon, authenticated;

-- Initial refresh of the materialized view
SELECT refresh_marketplace_cache();

SELECT '✅ Marketplace performance optimizations applied' as status;