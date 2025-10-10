-- Populate Marketplace Data
-- This script ensures all necessary data exists for the marketplace to display properly
-- Run this in your Supabase SQL Editor

-- ===============================
-- STEP 1: CHECK CURRENT DATA STATUS
-- ===============================

-- Check if providers table exists and has data
SELECT 'Checking providers table...' as status;
SELECT COUNT(*) as provider_count FROM providers;

-- Check if services table has data
SELECT 'Checking services table...' as status;
SELECT COUNT(*) as service_count FROM services;

-- Check if products table has data  
SELECT 'Checking products table...' as status;
SELECT COUNT(*) as product_count FROM products;

-- Check marketplace_listings view
SELECT 'Checking marketplace_listings view...' as status;
SELECT COUNT(*) as listing_count FROM marketplace_listings;

-- ===============================
-- STEP 2: INSERT SAMPLE PROVIDERS
-- ===============================

-- Insert sample providers to support services and products
INSERT INTO providers (
    id, name, email, phone, provider_type, business_name, address, city, country,
    bio, offers_services, offers_products, verified, is_active, featured, rating, reviews_count, service_types
) VALUES 
-- Veterinary Providers
(
    gen_random_uuid(),
    'Dr. Sarah Johnson',
    'sarah@pawsvet.com.au',
    '+61-2-9876-5432',
    'veterinarian',
    'Paws Veterinary Clinic',
    '123 Pet Street',
    'Sydney',
    'Australia',
    'Experienced veterinarian with 10+ years treating dogs, cats, and exotic pets. Specializing in surgery and emergency care.',
    true,
    true,
    true,
    true,
    true,
    4.9,
    127,
    ARRAY['Veterinary', 'Emergency Care', 'Surgery']
),
(
    gen_random_uuid(),
    'Dr. Michael Chen',
    'michael@mobilevet.co.nz',
    '+64-9-123-4567',
    'mobile_vet',
    'Mobile Vet Services NZ',
    '456 Mobile Ave',
    'Auckland',
    'New Zealand',
    'Mobile veterinary services bringing quality care to your doorstep. Available 24/7 for emergencies.',
    true,
    false,
    true,
    true,
    false,
    4.8,
    89,
    ARRAY['Veterinary', 'Mobile Services', 'Emergency Care']
),

-- Pet Grooming Providers
(
    gen_random_uuid(),
    'Emma Wilson',
    'emma@pawsandclaws.com.au',
    '+61-3-8765-4321',
    'groomer',
    'Paws & Claws Grooming Studio',
    '789 Grooming Lane',
    'Melbourne',
    'Australia',
    'Professional pet groomer specializing in breed-specific cuts and show preparation. Using only premium, pet-safe products.',
    true,
    true,
    true,
    true,
    true,
    4.7,
    156,
    ARRAY['Pet Grooming', 'Show Preparation']
),
(
    gen_random_uuid(),
    'James Thompson',
    'james@mobilepaws.co.nz',
    '+64-3-567-8901',
    'groomer',
    'Mobile Paws NZ',
    '321 Mobile Street',
    'Christchurch',
    'New Zealand',
    'Mobile grooming service that comes to your door. Stress-free experience for your pet in our custom-built van.',
    true,
    false,
    true,
    true,
    false,
    4.6,
    78,
    ARRAY['Pet Grooming', 'Mobile Services']
),

-- Pet Training Providers
(
    gen_random_uuid(),
    'Lisa Anderson',
    'lisa@caninetraining.co.nz',
    '+64-4-234-5678',
    'trainer',
    'Canine Training Academy',
    '654 Training Road',
    'Wellington',
    'New Zealand',
    'Certified dog trainer specializing in obedience, behavioral modification, and puppy training. Positive reinforcement methods only.',
    true,
    true,
    true,
    true,
    true,
    4.9,
    203,
    ARRAY['Pet Training', 'Behavioral Training', 'Puppy Training']
),

-- Pet Boarding & Daycare
(
    gen_random_uuid(),
    'Happy Tails Resort',
    'bookings@happytails.com.au',
    '+61-7-345-6789',
    'boarding',
    'Happy Tails Pet Resort',
    '987 Resort Drive',
    'Brisbane',
    'Australia',
    'Luxury pet boarding facility with individual suites, daily walks, and 24/7 supervision. Perfect for holidays and business trips.',
    true,
    true,
    true,
    true,
    true,
    4.8,
    92,
    ARRAY['Pet Boarding', 'Pet Daycare', 'Pet Sitting']
),

-- Pet Store Providers
(
    gen_random_uuid(),
    'Pet Paradise Store',
    'info@petparadise.com.au',
    '+61-8-456-7890',
    'pet_store',
    'Pet Paradise Supplies',
    '147 Pet Plaza',
    'Perth',
    'Australia',
    'Your one-stop shop for premium pet supplies, food, toys, and accessories. Specializing in natural and organic products.',
    false,
    true,
    true,
    true,
    false,
    4.5,
    234,
    ARRAY['Pet Supplies', 'Pet Food', 'Pet Accessories']
),

-- Breeding Services
(
    gen_random_uuid(),
    'Golden Dreams Kennels',
    'info@goldendreams.com.au',
    '+61-8-567-8901',
    'other',
    'Golden Dreams Breeding',
    '258 Kennel Road',
    'Perth',
    'Australia',
    'Ethical breeder of champion bloodline Golden Retrievers. Health tested parents, lifetime support, and comprehensive puppy starter pack.',
    true,
    false,
    true,
    true,
    true,
    4.9,
    45,
    ARRAY['Pet Breeding', 'Golden Retrievers']
),

-- Pet Photography
(
    gen_random_uuid(),
    'Capture Paws Photography',
    'info@capturepaws.co.nz',
    '+64-9-678-9012',
    'pet_photographer',
    'Capture Paws Studio',
    '369 Photo Street',
    'Auckland',
    'New Zealand',
    'Professional pet photography capturing the unique personality of your beloved pets. Studio and outdoor sessions available.',
    true,
    false,
    true,
    true,
    false,
    4.7,
    67,
    ARRAY['Pet Photography', 'Portrait Sessions']
),

-- Emergency Vet
(
    gen_random_uuid(),
    'Dr. Rachel Green',
    'emergency@24hourvet.com.au',
    '+61-2-789-0123',
    'emergency_vet',
    '24 Hour Emergency Vet',
    '741 Emergency Blvd',
    'Sydney',
    'Australia',
    'Emergency veterinary services available 24/7. Equipped with state-of-the-art facilities for critical care and surgery.',
    true,
    true,
    true,
    true,
    true,
    4.8,
    189,
    ARRAY['Emergency Care', 'Critical Care', 'Surgery']
)

ON CONFLICT (email) DO NOTHING;

-- ===============================
-- STEP 3: VERIFY MARKETPLACE VIEW
-- ===============================

-- Check if marketplace_listings view now has data
SELECT 'Final marketplace check...' as status;
SELECT 
    listing_type,
    COUNT(*) as count,
    AVG(price) as avg_price
FROM marketplace_listings 
GROUP BY listing_type;

-- Show sample listings
SELECT 'Sample marketplace listings:' as status;
SELECT 
    listing_type,
    name,
    provider_name,
    city,
    price,
    category
FROM marketplace_listings 
ORDER BY created_at DESC 
LIMIT 10;

-- ===============================
-- STEP 4: SUCCESS MESSAGE
-- ===============================

SELECT '✅ Marketplace data population complete!' as status;
SELECT 'Visit http://localhost:3000/marketplace to see your listings!' as next_step;