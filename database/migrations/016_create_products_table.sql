-- Create products table for pet business product catalog
-- This table stores product information for pet businesses

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  brand TEXT,
  sku TEXT UNIQUE,
  weight_kg DECIMAL(8,2),
  dimensions TEXT,
  age_group TEXT, -- 'puppy', 'adult', 'senior', 'all'
  pet_type TEXT, -- 'dog', 'cat', 'bird', 'fish', 'all'
  is_prescription BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_provider_id ON products(provider_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_pet_type ON products(pet_type);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
-- Allow public read access to active products
CREATE POLICY "Allow public read access to active products" ON products
FOR SELECT USING (is_active = true);

-- Allow authenticated users to insert products for their own business
CREATE POLICY "Allow users to insert their own products" ON products
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  provider_id IN (SELECT id FROM providers WHERE id = auth.uid())
);

-- Allow users to update their own products
CREATE POLICY "Allow users to update their own products" ON products
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  provider_id IN (SELECT id FROM providers WHERE id = auth.uid())
);

-- Allow users to delete their own products
CREATE POLICY "Allow users to delete their own products" ON products
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  provider_id IN (SELECT id FROM providers WHERE id = auth.uid())
);

-- Create trigger to update updated_at column
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products for testing (optional)
INSERT INTO products (
    provider_id, name, description, category, subcategory, price, stock_quantity, 
    brand, sku, weight_kg, age_group, pet_type, is_prescription, is_active
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440009'::uuid,
    'Premium Dog Food - Royal Canin',
    'High-quality nutrition for adult dogs with real chicken and vegetables',
    'Food',
    'Dry Food',
    45.99,
    24,
    'Royal Canin',
    'RC-DOG-001',
    15.0,
    'adult',
    'dog',
    false,
    true
),
(
    '550e8400-e29b-41d4-a716-446655440009'::uuid,
    'Interactive Puzzle Toy',
    'Mental stimulation toy for dogs to prevent boredom',
    'Toys',
    'Interactive',
    19.99,
    15,
    'PuzzlePaws',
    'PP-TOY-001',
    0.5,
    'all',
    'dog',
    false,
    true
),
(
    '550e8400-e29b-41d4-a716-446655440009'::uuid,
    'Orthopedic Pet Bed',
    'Comfortable memory foam bed for senior pets with joint issues',
    'Accessories',
    'Bedding',
    89.99,
    3,
    'ComfortRest',
    'CR-BED-001',
    3.5,
    'senior',
    'all',
    false,
    true
) ON CONFLICT (sku) DO NOTHING;

SELECT '✅ Products table created successfully' as status;
SELECT 'Sample products added for testing' as info;