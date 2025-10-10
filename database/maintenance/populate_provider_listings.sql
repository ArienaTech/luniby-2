-- POPULATE PROVIDER_LISTINGS TABLE
-- This script populates the existing provider_listings table with marketplace data
-- Run this in your Supabase SQL Editor

-- ===============================
-- STEP 1: CLEAN EXISTING DATA
-- ===============================

SELECT '🧹 CLEANING EXISTING PROVIDER LISTINGS...' as step;

-- Delete existing provider listings
DELETE FROM provider_listings;

SELECT '✅ Existing provider listings cleaned' as status;

-- ===============================
-- STEP 2: INSERT COMPREHENSIVE PROVIDER LISTINGS
-- ===============================

SELECT '📋 CREATING PROVIDER LISTINGS...' as step;

INSERT INTO provider_listings (
    title, description, service_type, location, price_from, price_to, 
    provider_name, provider_type, provider_email, provider_phone, rating, reviews_count, verified, active
) VALUES 

-- VETERINARY SERVICES
('Professional Veterinary Care - Sydney', 'Comprehensive veterinary services including health checkups, vaccinations, surgery, and emergency care. Experienced veterinarian with 10+ years treating dogs, cats, and exotic pets.', 'Veterinary', 'Sydney, AU', 85.00, 800.00, 'Dr. Sarah Johnson', 'Veterinarian', 'sarah@pawsvet.com.au', '+61-2-9876-5432', 4.9, 127, true, true),

('Mobile Veterinary Services - Auckland', 'Professional veterinary services at your home. Perfect for anxious pets or multiple pet households. Available 24/7 for emergencies with complete vaccination services.', 'Veterinary', 'Auckland, NZ', 95.00, 120.00, 'Dr. Michael Chen', 'Mobile Vet', 'michael@mobilevet.co.nz', '+64-9-123-4567', 4.8, 89, true, true),

('24/7 Emergency Veterinary Care', 'Emergency veterinary services available 24/7. Equipped with state-of-the-art facilities for critical care, intensive monitoring, and emergency surgery procedures.', 'Veterinary', 'Sydney, AU', 200.00, 800.00, 'Dr. Rachel Green', 'Emergency Vet', 'emergency@24hourvet.com.au', '+61-2-789-0123', 4.8, 189, true, true),

-- PET GROOMING SERVICES
('Premium Pet Grooming Studio - Melbourne', 'Professional pet grooming including full service grooming, show dog preparation, and specialized de-shedding treatments. Using only premium, pet-safe products for all breeds.', 'Pet Grooming', 'Melbourne, AU', 65.00, 150.00, 'Emma Wilson', 'Professional Groomer', 'emma@pawsandclaws.com.au', '+61-3-8765-4321', 4.7, 156, true, true),

('Mobile Pet Grooming - Christchurch', 'Convenient mobile grooming service that comes to your door. Full grooming service in our custom-built van. Stress-free experience for your pet at home.', 'Pet Grooming', 'Christchurch, NZ', 85.00, 85.00, 'James Thompson', 'Mobile Groomer', 'james@mobilepaws.co.nz', '+64-3-567-8901', 4.6, 78, true, true),

-- PET TRAINING SERVICES
('Certified Dog Training - Wellington', 'Professional dog training services including puppy classes, private training, and behavioral modification. Certified trainer specializing in positive reinforcement methods.', 'Pet Training', 'Wellington, NZ', 65.00, 150.00, 'Lisa Anderson', 'Certified Trainer', 'lisa@caninetraining.co.nz', '+64-4-234-5678', 4.9, 203, true, true),

('Behavioral Dog Training - Brisbane', 'Specialist in aggressive dog rehabilitation and behavioral modification. 15+ years experience with difficult cases using safety-focused approaches.', 'Pet Training', 'Brisbane, AU', 120.00, 200.00, 'Mark Roberts', 'Behavioral Specialist', 'mark@dogbehavior.com.au', '+61-7-456-7890', 4.8, 145, true, true),

-- PET BOARDING SERVICES
('Luxury Pet Boarding Resort - Brisbane', 'Premium pet boarding facility with individual suites, daily walks, playtime, supervised daycare, and 24/7 supervision. Perfect for holidays and business trips.', 'Pet Boarding', 'Brisbane, AU', 45.00, 65.00, 'Happy Tails Resort', 'Pet Resort', 'bookings@happytails.com.au', '+61-7-345-6789', 4.8, 92, true, true),

-- PET SUPPLIES & PRODUCTS
('Premium Pet Supplies Store - Perth', 'Your one-stop shop for premium pet supplies, food, toys, and accessories. Specializing in natural and organic products with expert nutritional advice.', 'Pet Supplies', 'Perth, AU', 12.99, 129.99, 'Pet Paradise Store', 'Pet Store', 'info@petparadise.com.au', '+61-8-456-7890', 4.5, 234, true, true),

('Natural & Organic Pet Products - Auckland', 'Specializing in organic, natural, and eco-friendly pet products. Raw food specialists with professional nutritional consultation services available.', 'Pet Supplies', 'Auckland, NZ', 12.99, 89.99, 'Natural Pet Co', 'Organic Pet Store', 'orders@naturalpet.co.nz', '+64-9-567-8901', 4.6, 178, true, true),

-- SPECIALTY SERVICES
('Golden Retriever Breeding - Perth', 'Ethical breeder of champion bloodline Golden Retrievers. Health tested parents, comprehensive health guarantees, lifetime support, and complete puppy starter pack included.', 'Pet Breeding', 'Perth, AU', 2200.00, 2500.00, 'Golden Dreams Kennels', 'Ethical Breeder', 'info@goldendreams.com.au', '+61-8-567-8901', 4.9, 45, true, true),

('Professional Pet Photography - Auckland', 'Professional pet photography capturing the unique personality of your beloved pets. Studio and outdoor sessions available with custom packages and prints.', 'Pet Photography', 'Auckland, NZ', 150.00, 250.00, 'Capture Paws Photography', 'Pet Photographer', 'info@capturepaws.co.nz', '+64-9-678-9012', 4.7, 67, true, true),

-- ADDITIONAL VETERINARY SERVICES
('Exotic Pet Veterinarian - Sydney', 'Specialized veterinary care for exotic pets including birds, reptiles, rabbits, and small mammals. Expert knowledge in exotic pet health and nutrition.', 'Veterinary', 'Sydney, AU', 120.00, 300.00, 'Dr. Amanda White', 'Exotic Vet', 'amanda@exoticpetcare.com.au', '+61-2-555-0123', 4.7, 98, true, true),

('Pet Dental Care Specialist - Melbourne', 'Professional pet dental care including cleanings, extractions, and oral surgery. Specialized equipment and anesthesia-free options available.', 'Veterinary', 'Melbourne, AU', 150.00, 400.00, 'Dr. James Miller', 'Veterinary Dentist', 'james@petdentalcare.com.au', '+61-3-555-0456', 4.8, 156, true, true),

-- ADDITIONAL GROOMING SERVICES
('Cat Grooming Specialist - Auckland', 'Specialized cat grooming services with gentle techniques for anxious cats. Full grooming, nail trimming, and flea treatments in a calm environment.', 'Pet Grooming', 'Auckland, NZ', 60.00, 90.00, 'Sarah Cat Care', 'Cat Groomer', 'sarah@catgrooming.co.nz', '+64-9-555-0789', 4.6, 89, true, true),

-- ADDITIONAL TRAINING SERVICES
('Puppy Socialization Classes - Melbourne', 'Early puppy socialization and training classes. Focus on proper socialization, basic commands, and preventing behavioral problems before they start.', 'Pet Training', 'Melbourne, AU', 45.00, 80.00, 'Puppy Academy Melbourne', 'Puppy Trainer', 'info@puppyacademy.com.au', '+61-3-555-0321', 4.8, 234, true, true),

-- PET SITTING & WALKING
('Professional Pet Sitting - Sydney', 'Reliable pet sitting and dog walking services in Sydney. Experienced pet carer offering in-home care, daily walks, and overnight sitting services.', 'Pet Sitting', 'Sydney, AU', 35.00, 80.00, 'Sydney Pet Care', 'Pet Sitter', 'care@sydneypetcare.com.au', '+61-2-555-0654', 4.7, 178, true, true),

('Dog Walking Services - Wellington', 'Professional dog walking services for busy pet owners. Individual and group walks available with GPS tracking and daily photo updates.', 'Dog Walking', 'Wellington, NZ', 25.00, 45.00, 'Wellington Dog Walkers', 'Dog Walker', 'walks@wellingtonwalkers.co.nz', '+64-4-555-0987', 4.6, 145, true, true),

-- HOLISTIC & ALTERNATIVE CARE
('Pet Massage & Physiotherapy - Brisbane', 'Therapeutic massage and physiotherapy for pets recovering from injury or surgery. Certified in canine massage and rehabilitation techniques.', 'Holistic Care', 'Brisbane, AU', 80.00, 120.00, 'Healing Paws Therapy', 'Pet Therapist', 'therapy@healingpaws.com.au', '+61-7-555-0123', 4.8, 67, true, true),

('Pet Acupuncture & TCM - Auckland', 'Traditional Chinese Medicine for pets including acupuncture, herbal medicine, and holistic treatments for chronic conditions and pain management.', 'Holistic Care', 'Auckland, NZ', 100.00, 150.00, 'Dr. Lin Zhang', 'Holistic Vet', 'lin@holisticpet.co.nz', '+64-9-555-0456', 4.9, 89, true, true);

SELECT '✅ 20 provider listings created successfully' as status;

-- ===============================
-- STEP 3: VERIFY THE DATA
-- ===============================

SELECT '🔍 VERIFICATION RESULTS' as step;

-- Count total listings
SELECT 'Total provider listings:' as metric, COUNT(*) as count FROM provider_listings;

-- Show breakdown by service type
SELECT 'LISTINGS BY SERVICE TYPE:' as section;
SELECT 
    service_type,
    COUNT(*) as count,
    MIN(price_from) as min_price,
    MAX(price_to) as max_price,
    ROUND(AVG((price_from + price_to) / 2)::NUMERIC, 2) as avg_price
FROM provider_listings 
GROUP BY service_type 
ORDER BY count DESC;

-- Show breakdown by location
SELECT 'LISTINGS BY LOCATION:' as section;
SELECT 
    location,
    COUNT(*) as count,
    STRING_AGG(DISTINCT service_type, ', ') as service_types
FROM provider_listings 
GROUP BY location 
ORDER BY count DESC;

-- Show sample listings
SELECT 'SAMPLE LISTINGS:' as section;
SELECT 
    service_type,
    LEFT(title, 50) || '...' as title_preview,
    provider_name,
    location,
    price_from,
    price_to,
    rating
FROM provider_listings 
ORDER BY service_type, rating DESC
LIMIT 10;

-- Show verified providers
SELECT 'VERIFIED PROVIDERS:' as section;
SELECT COUNT(*) as verified_count FROM provider_listings WHERE verified = true;
SELECT COUNT(*) as active_count FROM provider_listings WHERE active = true;

-- ===============================
-- STEP 4: SUCCESS MESSAGE
-- ===============================

SELECT '🎉 PROVIDER LISTINGS POPULATION COMPLETE!' as result;
SELECT '✅ 20 diverse provider listings created across 10+ service categories' as summary;
SELECT '🌐 Visit /marketplace to see your populated marketplace!' as action;
SELECT '📍 Covers major cities in Australia and New Zealand' as coverage;
SELECT '⭐ All providers have realistic ratings and review counts' as quality;