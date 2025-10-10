-- RECREATE MARKETPLACE DATA WITH PROPER RELATIONSHIPS
-- This script deletes all existing data and creates fresh, properly integrated data
-- Run this in your Supabase SQL Editor

-- ===============================
-- STEP 1: CLEAN EXISTING DATA
-- ===============================

SELECT '🧹 CLEANING EXISTING DATA...' as step;

-- Delete in correct order to avoid foreign key constraints
DELETE FROM consultation_bookings;
DELETE FROM services;
DELETE FROM products;
DELETE FROM providers;

SELECT '✅ All existing data cleaned' as status;

-- ===============================
-- STEP 2: CREATE PROVIDERS WITH PROPER STRUCTURE
-- ===============================

SELECT '👥 CREATING PROVIDERS...' as step;

INSERT INTO providers (
    id, name, email, phone, provider_type, business_name, address, city, country,
    bio, offers_services, offers_products, verified, is_active, featured, rating, reviews_count, service_types
) VALUES 

-- VETERINARY PROVIDERS
('550e8400-e29b-41d4-a716-446655440001', 'Dr. Sarah Johnson', 'sarah@pawsvet.com.au', '+61-2-9876-5432', 'veterinarian', 'Paws Veterinary Clinic', '123 Pet Street', 'Sydney', 'Australia', 'Experienced veterinarian with 10+ years treating dogs, cats, and exotic pets. Specializing in surgery and emergency care.', true, true, true, true, true, 4.9, 127, ARRAY['Veterinary', 'Emergency Care', 'Surgery']),

('550e8400-e29b-41d4-a716-446655440002', 'Dr. Michael Chen', 'michael@mobilevet.co.nz', '+64-9-123-4567', 'mobile_vet', 'Mobile Vet Services NZ', '456 Mobile Ave', 'Auckland', 'New Zealand', 'Mobile veterinary services bringing quality care to your doorstep. Available 24/7 for emergencies.', true, false, true, true, false, 4.8, 89, ARRAY['Veterinary', 'Mobile Services', 'Emergency Care']),

('550e8400-e29b-41d4-a716-446655440003', 'Dr. Rachel Green', 'emergency@24hourvet.com.au', '+61-2-789-0123', 'emergency_vet', '24 Hour Emergency Vet', '741 Emergency Blvd', 'Sydney', 'Australia', 'Emergency veterinary services available 24/7. Equipped with state-of-the-art facilities for critical care and surgery.', true, true, true, true, true, 4.8, 189, ARRAY['Emergency Care', 'Critical Care', 'Surgery']),

-- PET GROOMING PROVIDERS
('550e8400-e29b-41d4-a716-446655440004', 'Emma Wilson', 'emma@pawsandclaws.com.au', '+61-3-8765-4321', 'groomer', 'Paws & Claws Grooming Studio', '789 Grooming Lane', 'Melbourne', 'Australia', 'Professional pet groomer specializing in breed-specific cuts and show preparation. Using only premium, pet-safe products.', true, true, true, true, true, 4.7, 156, ARRAY['Pet Grooming', 'Show Preparation']),

('550e8400-e29b-41d4-a716-446655440005', 'James Thompson', 'james@mobilepaws.co.nz', '+64-3-567-8901', 'groomer', 'Mobile Paws NZ', '321 Mobile Street', 'Christchurch', 'New Zealand', 'Mobile grooming service that comes to your door. Stress-free experience for your pet in our custom-built van.', true, false, true, true, false, 4.6, 78, ARRAY['Pet Grooming', 'Mobile Services']),

-- PET TRAINING PROVIDERS
('550e8400-e29b-41d4-a716-446655440006', 'Lisa Anderson', 'lisa@caninetraining.co.nz', '+64-4-234-5678', 'trainer', 'Canine Training Academy', '654 Training Road', 'Wellington', 'New Zealand', 'Certified dog trainer specializing in obedience, behavioral modification, and puppy training. Positive reinforcement methods only.', true, true, true, true, true, 4.9, 203, ARRAY['Pet Training', 'Behavioral Training', 'Puppy Training']),

('550e8400-e29b-41d4-a716-446655440007', 'Mark Roberts', 'mark@dogbehavior.com.au', '+61-7-456-7890', 'trainer', 'Canine Behavior Solutions', '852 Training Ave', 'Brisbane', 'Australia', 'Specialist in aggressive dog rehabilitation and behavioral modification. 15+ years experience with difficult cases.', true, false, true, true, false, 4.8, 145, ARRAY['Behavioral Training', 'Aggression Training']),

-- PET BOARDING & DAYCARE
('550e8400-e29b-41d4-a716-446655440008', 'Happy Tails Resort', 'bookings@happytails.com.au', '+61-7-345-6789', 'boarding', 'Happy Tails Pet Resort', '987 Resort Drive', 'Brisbane', 'Australia', 'Luxury pet boarding facility with individual suites, daily walks, and 24/7 supervision. Perfect for holidays and business trips.', true, true, true, true, true, 4.8, 92, ARRAY['Pet Boarding', 'Pet Daycare', 'Pet Sitting']),

-- PET STORES & SUPPLIERS
('550e8400-e29b-41d4-a716-446655440009', 'Pet Paradise Store', 'info@petparadise.com.au', '+61-8-456-7890', 'pet_store', 'Pet Paradise Supplies', '147 Pet Plaza', 'Perth', 'Australia', 'Your one-stop shop for premium pet supplies, food, toys, and accessories. Specializing in natural and organic products.', false, true, true, true, false, 4.5, 234, ARRAY['Pet Supplies', 'Pet Food', 'Pet Accessories']),

('550e8400-e29b-41d4-a716-446655440010', 'Natural Pet Co', 'orders@naturalpet.co.nz', '+64-9-567-8901', 'pet_store', 'Natural Pet Company', '963 Organic Street', 'Auckland', 'New Zealand', 'Specializing in organic, natural, and eco-friendly pet products. Raw food specialists with nutritional consultation services.', true, true, true, true, true, 4.6, 178, ARRAY['Organic Pet Food', 'Nutritional Consulting']),

-- SPECIALTY SERVICES
('550e8400-e29b-41d4-a716-446655440011', 'Golden Dreams Kennels', 'info@goldendreams.com.au', '+61-8-567-8901', 'other', 'Golden Dreams Breeding', '258 Kennel Road', 'Perth', 'Australia', 'Ethical breeder of champion bloodline Golden Retrievers. Health tested parents, lifetime support, and comprehensive puppy starter pack.', true, false, true, true, true, 4.9, 45, ARRAY['Pet Breeding', 'Golden Retrievers']),

('550e8400-e29b-41d4-a716-446655440012', 'Capture Paws Photography', 'info@capturepaws.co.nz', '+64-9-678-9012', 'pet_photographer', 'Capture Paws Studio', '369 Photo Street', 'Auckland', 'New Zealand', 'Professional pet photography capturing the unique personality of your beloved pets. Studio and outdoor sessions available.', true, false, true, true, false, 4.7, 67, ARRAY['Pet Photography', 'Portrait Sessions']);

SELECT '✅ 12 providers created successfully' as status;

-- ===============================
-- STEP 3: CREATE SERVICES WITH PROPER PROVIDER RELATIONSHIPS
-- ===============================

SELECT '🛠️ CREATING SERVICES...' as step;

INSERT INTO services (
    provider_id, title, description, service_type, price, duration_minutes, location, location_type, image_url, is_active
) VALUES 

-- VETERINARY SERVICES
('550e8400-e29b-41d4-a716-446655440001', 'General Health Checkup', 'Comprehensive health examination including vaccinations, dental check, and health assessment for dogs and cats.', 'Veterinary', 85.00, 45, 'Sydney', 'in_person', null, true),
('550e8400-e29b-41d4-a716-446655440001', 'Pet Surgery Services', 'Professional surgical procedures including spaying, neutering, and emergency surgery with full aftercare.', 'Veterinary', 450.00, 120, 'Sydney', 'in_person', null, true),
('550e8400-e29b-41d4-a716-446655440001', 'Emergency Pet Care', '24/7 emergency veterinary care for critical situations. Immediate response for pet emergencies.', 'Veterinary', 200.00, 60, 'Sydney', 'in_person', null, true),

('550e8400-e29b-41d4-a716-446655440002', 'Mobile Vet House Calls', 'Professional veterinary services at your home. Perfect for anxious pets or multiple pet households.', 'Veterinary', 120.00, 60, 'Auckland', 'mobile', null, true),
('550e8400-e29b-41d4-a716-446655440002', 'Pet Vaccination Service', 'Complete vaccination service at your doorstep. Includes all core vaccines and health certificates.', 'Veterinary', 95.00, 30, 'Auckland', 'mobile', null, true),

('550e8400-e29b-41d4-a716-446655440003', 'Critical Care Emergency', 'Intensive care for critically ill pets with 24/7 monitoring and advanced life support equipment.', 'Veterinary', 350.00, 240, 'Sydney', 'in_person', null, true),
('550e8400-e29b-41d4-a716-446655440003', 'Emergency Surgery', 'Emergency surgical procedures available 24/7 with experienced emergency veterinary surgeons.', 'Veterinary', 800.00, 180, 'Sydney', 'in_person', null, true),

-- PET GROOMING SERVICES
('550e8400-e29b-41d4-a716-446655440004', 'Full Service Pet Grooming', 'Complete grooming package including wash, cut, nail trim, ear cleaning, and styling for all breeds.', 'Pet Grooming', 75.00, 90, 'Melbourne', 'in_person', null, true),
('550e8400-e29b-41d4-a716-446655440004', 'Show Dog Preparation', 'Professional show preparation including breed-standard cuts and presentation grooming.', 'Pet Grooming', 150.00, 120, 'Melbourne', 'in_person', null, true),
('550e8400-e29b-41d4-a716-446655440004', 'De-shedding Treatment', 'Specialized de-shedding treatment to reduce shedding by up to 90% for 4-6 weeks.', 'Pet Grooming', 65.00, 60, 'Melbourne', 'in_person', null, true),

('550e8400-e29b-41d4-a716-446655440005', 'Mobile Pet Grooming', 'Full grooming service in our mobile van. Convenient and stress-free grooming at your doorstep.', 'Pet Grooming', 85.00, 75, 'Christchurch', 'mobile', null, true),

-- PET TRAINING SERVICES
('550e8400-e29b-41d4-a716-446655440006', 'Puppy Training Classes', 'Group puppy training classes covering basic obedience, socialization, and house training.', 'Pet Training', 65.00, 60, 'Wellington', 'in_person', null, true),
('550e8400-e29b-41d4-a716-446655440006', 'Private Dog Training', 'One-on-one training sessions customized to your dogs specific behavioral needs.', 'Pet Training', 120.00, 90, 'Wellington', 'both', null, true),
('550e8400-e29b-41d4-a716-446655440006', 'Behavioral Modification', 'Specialized training for dogs with behavioral issues including aggression, anxiety, and fears.', 'Pet Training', 150.00, 90, 'Wellington', 'both', null, true),

('550e8400-e29b-41d4-a716-446655440007', 'Aggressive Dog Rehabilitation', 'Specialized program for aggressive dogs with certified behaviorist. Safety-focused approach.', 'Pet Training', 200.00, 120, 'Brisbane', 'in_person', null, true),

-- PET BOARDING & DAYCARE SERVICES
('550e8400-e29b-41d4-a716-446655440008', 'Luxury Pet Boarding', 'Premium boarding with individual suites, daily walks, playtime, and 24/7 supervision.', 'Pet Boarding', 65.00, 1440, 'Brisbane', 'in_person', null, true),
('550e8400-e29b-41d4-a716-446655440008', 'Pet Daycare Services', 'Daily pet daycare with supervised play, socialization, and exercise for working pet parents.', 'Pet Boarding', 45.00, 480, 'Brisbane', 'in_person', null, true),

-- SPECIALTY SERVICES
('550e8400-e29b-41d4-a716-446655440010', 'Pet Nutrition Consultation', 'Professional nutritional assessment and custom diet planning for optimal pet health.', 'Nutritionists', 90.00, 60, 'Auckland', 'both', null, true),

('550e8400-e29b-41d4-a716-446655440011', 'Golden Retriever Breeding', 'Ethical breeding of champion bloodline Golden Retrievers with health guarantees and lifetime support.', 'Pet Breeding', 2200.00, 60, 'Perth', 'in_person', null, true),

('550e8400-e29b-41d4-a716-446655440012', 'Professional Pet Photography', 'Studio and outdoor pet photography sessions capturing your pets unique personality.', 'Pet Photography', 180.00, 90, 'Auckland', 'both', null, true);

SELECT '✅ 20 services created successfully' as status;

-- ===============================
-- STEP 4: CREATE PRODUCTS WITH PROPER PROVIDER RELATIONSHIPS
-- ===============================

SELECT '🛍️ CREATING PRODUCTS...' as step;

INSERT INTO products (
    provider_id, name, description, category, subcategory, price, stock_quantity, brand, sku, weight_kg, age_group, pet_type, is_prescription, image_url, is_active
) VALUES 

-- VETERINARY PRODUCTS
('550e8400-e29b-41d4-a716-446655440001', 'Premium Dog Multivitamin', 'Complete daily multivitamin for dogs with essential vitamins, minerals, and omega fatty acids.', 'Health & Wellness', 'Supplements', 45.99, 50, 'VetHealth', 'VH-DOG-MULTI-001', 0.5, 'all', 'dog', false, null, true),
('550e8400-e29b-41d4-a716-446655440001', 'Prescription Joint Support', 'Veterinary prescription joint supplement for dogs with arthritis and mobility issues.', 'Health & Wellness', 'Prescription', 89.99, 25, 'VetRx', 'VRX-JOINT-001', 0.3, 'senior', 'dog', true, null, true),
('550e8400-e29b-41d4-a716-446655440001', 'Flea & Tick Prevention', 'Monthly flea and tick prevention treatment for dogs and cats. Vet-recommended formula.', 'Health & Wellness', 'Parasite Control', 65.99, 75, 'ParasiteShield', 'PS-FLEA-001', 0.1, 'all', 'all', false, null, true),

('550e8400-e29b-41d4-a716-446655440003', 'Emergency First Aid Kit', 'Complete pet first aid kit with bandages, antiseptic, thermometer, and emergency guide.', 'Health & Wellness', 'First Aid', 79.99, 30, 'EmergencyPet', 'EP-KIT-001', 1.2, 'all', 'all', false, null, true),

-- GROOMING PRODUCTS
('550e8400-e29b-41d4-a716-446655440004', 'Professional Dog Shampoo', 'Premium hypoallergenic shampoo used by professional groomers. Suitable for sensitive skin.', 'Grooming', 'Shampoo', 32.99, 100, 'GroomPro', 'GP-SHAMP-001', 0.5, 'all', 'dog', false, null, true),
('550e8400-e29b-41d4-a716-446655440004', 'De-shedding Tool', 'Professional-grade de-shedding tool that reduces shedding by up to 90%.', 'Grooming', 'Tools', 49.99, 40, 'ShedAway', 'SA-TOOL-001', 0.3, 'all', 'all', false, null, true),
('550e8400-e29b-41d4-a716-446655440004', 'Nail Clippers Professional', 'Veterinary-grade nail clippers with safety guard and ergonomic grip.', 'Grooming', 'Tools', 24.99, 60, 'ClipSafe', 'CS-CLIP-001', 0.2, 'all', 'all', false, null, true),

-- PET STORE PRODUCTS
('550e8400-e29b-41d4-a716-446655440009', 'Premium Dry Dog Food', 'High-quality dry dog food with real chicken, vegetables, and no artificial preservatives.', 'Food', 'Dry Food', 89.99, 200, 'NaturalChoice', 'NC-DOG-DRY-001', 15.0, 'adult', 'dog', false, null, true),
('550e8400-e29b-41d4-a716-446655440009', 'Cat Litter Premium', 'Clumping clay cat litter with odor control and dust-free formula.', 'Supplies', 'Litter', 19.99, 150, 'CleanPaws', 'CP-LITTER-001', 9.0, 'all', 'cat', false, null, true),
('550e8400-e29b-41d4-a716-446655440009', 'Interactive Dog Toy', 'Puzzle toy that challenges dogs mentally while providing hours of entertainment.', 'Toys', 'Interactive', 34.99, 80, 'BrainGames', 'BG-TOY-001', 0.8, 'all', 'dog', false, null, true),
('550e8400-e29b-41d4-a716-446655440009', 'Comfortable Dog Bed', 'Orthopedic memory foam dog bed with washable cover. Perfect for senior dogs.', 'Accessories', 'Bedding', 129.99, 25, 'ComfortRest', 'CR-BED-001', 3.5, 'all', 'dog', false, null, true),
('550e8400-e29b-41d4-a716-446655440009', 'Stainless Steel Food Bowl', 'Non-slip stainless steel food and water bowl set. Dishwasher safe.', 'Accessories', 'Feeding', 29.99, 120, 'DinePet', 'DP-BOWL-001', 0.6, 'all', 'all', false, null, true),

-- NATURAL PET PRODUCTS
('550e8400-e29b-41d4-a716-446655440010', 'Organic Raw Dog Food', 'Frozen raw dog food made with organic, grass-fed beef and organic vegetables.', 'Food', 'Raw Food', 45.99, 60, 'RawNature', 'RN-RAW-BEEF-001', 2.0, 'adult', 'dog', false, null, true),
('550e8400-e29b-41d4-a716-446655440010', 'Natural Dental Chews', 'Organic dental chews that help clean teeth and freshen breath naturally.', 'Treats', 'Dental', 22.99, 90, 'NaturalClean', 'NC-DENTAL-001', 0.4, 'all', 'dog', false, null, true),
('550e8400-e29b-41d4-a716-446655440010', 'Hemp Oil for Pets', 'Organic hemp oil supplement for anxiety, joint health, and overall wellness.', 'Health & Wellness', 'Supplements', 59.99, 35, 'HempWellness', 'HW-OIL-001', 0.25, 'all', 'all', false, null, true),
('550e8400-e29b-41d4-a716-446655440010', 'Eco-Friendly Waste Bags', 'Biodegradable waste bags made from plant-based materials. Earth-friendly choice.', 'Supplies', 'Waste Management', 12.99, 200, 'EcoClean', 'EC-BAGS-001', 0.3, 'all', 'dog', false, null, true);

SELECT '✅ 16 products created successfully' as status;

-- ===============================
-- STEP 5: VERIFY ALL DATA AND RELATIONSHIPS
-- ===============================

SELECT '🔍 VERIFICATION RESULTS' as step;

-- Count all records
SELECT 'Total providers:' as metric, COUNT(*) as count FROM providers;
SELECT 'Total services:' as metric, COUNT(*) as count FROM services;
SELECT 'Total products:' as metric, COUNT(*) as count FROM products;
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
    name,
    provider_name,
    city,
    price,
    category
FROM marketplace_listings 
ORDER BY listing_type, price
LIMIT 10;

-- Show providers by city
SELECT 'PROVIDERS BY CITY:' as section;
SELECT 
    city,
    COUNT(*) as provider_count,
    STRING_AGG(DISTINCT provider_type, ', ') as provider_types
FROM providers 
GROUP BY city 
ORDER BY provider_count DESC;

-- ===============================
-- STEP 6: SUCCESS MESSAGE
-- ===============================

SELECT '🎉 MARKETPLACE DATA RECREATION COMPLETE!' as result;
SELECT '✅ 12 providers, 20 services, 16 products created with proper relationships' as summary;
SELECT '🌐 Visit /marketplace to see your fully populated marketplace!' as action;
SELECT '🔍 All data is properly integrated and ready for use' as status;