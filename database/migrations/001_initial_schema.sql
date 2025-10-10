-- Create the provider_listings table for the petcare marketplace
CREATE TABLE IF NOT EXISTS provider_listings (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  service_type TEXT NOT NULL,
  location TEXT NOT NULL,
  price_from DECIMAL(10,2) NOT NULL,
  price_to DECIMAL(10,2) NOT NULL,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  provider_email TEXT,
  provider_phone TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  image_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create an index on service_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_provider_listings_service_type ON provider_listings(service_type);

-- Create an index on location for faster filtering
CREATE INDEX IF NOT EXISTS idx_provider_listings_location ON provider_listings(location);

-- Create an index on active status for faster queries
CREATE INDEX IF NOT EXISTS idx_provider_listings_active ON provider_listings(active);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_provider_listings_created_at ON provider_listings(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE provider_listings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active listings
CREATE POLICY "Allow public read access to active listings" ON provider_listings
FOR SELECT USING (active = true);

-- Create policy to allow authenticated users to insert their own listings
CREATE POLICY "Allow authenticated users to insert listings" ON provider_listings
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow users to update their own listings
CREATE POLICY "Allow users to update their own listings" ON provider_listings
FOR UPDATE USING (auth.uid()::text = provider_email);

-- Insert sample data
INSERT INTO provider_listings (
  title, description, service_type, location, price_from, price_to, 
  provider_name, provider_type, provider_email, rating, reviews_count, verified
) VALUES 
(
  'Professional Dog Walking & Pet Sitting',
  'Experienced pet carer offering reliable dog walking and pet sitting services in Auckland. 5+ years experience with all breeds, fully insured and police checked.',
  'Dog Walking',
  'Auckland, NZ',
  25.00,
  50.00,
  'Sarah Johnson',
  'Pet Business',
  'sarah@pawsandwalks.co.nz',
  4.9,
  127,
  true
),
(
  'Mobile Veterinary Services',
  'Qualified veterinarian providing mobile vet services across Sydney. Emergency calls available 24/7. Specializing in routine check-ups, vaccinations, and minor procedures.',
  'Veterinary Care',
  'Sydney, AU',
  80.00,
  200.00,
  'Dr. Michael Chen',
  'Vet Clinic',
  'dr.chen@mobilevet.com.au',
  4.8,
  89,
  true
),
(
  'Premium Pet Grooming Studio',
  'Full-service pet grooming including wash, cut, nail trimming, and styling. Specializing in show dogs and breed-specific cuts. Using only premium, pet-safe products.',
  'Pet Grooming',
  'Melbourne, AU',
  60.00,
  120.00,
  'Paws & Claws Grooming',
  'Groomer',
  'info@pawsandclaws.com.au',
  4.7,
  156,
  true
),
(
  'Certified Dog Training Classes',
  'Group and individual dog training sessions. Puppy training, obedience, and behavioral modification. Positive reinforcement methods only.',
  'Pet Training',
  'Wellington, NZ',
  40.00,
  100.00,
  'Emma Wilson',
  'Trainer',
  'emma@caninetraining.co.nz',
  4.9,
  203,
  true
),
(
  'Luxury Pet Boarding Facility',
  'Premium pet boarding with individual suites, daily walks, and 24/7 supervision. Perfect for holidays and business trips. Indoor and outdoor play areas.',
  'Pet Boarding',
  'Brisbane, AU',
  45.00,
  85.00,
  'Happy Tails Resort',
  'Pet Business',
  'bookings@happytails.com.au',
  4.8,
  92,
  true
),
(
  'Registered Golden Retriever Breeder',
  'Ethical breeder of champion bloodline Golden Retrievers. Health tested parents, lifetime support, and comprehensive puppy starter pack included.',
  'Pet Breeding',
  'Perth, AU',
  1200.00,
  2500.00,
  'Golden Dreams Kennels',
  'Breeder',
  'info@goldendreams.com.au',
  4.9,
  45,
  true
),
(
  'Mobile Pet Grooming Service',
  'Convenient mobile grooming service that comes to your door. Full grooming services in our custom-built van. Stress-free experience for your pet.',
  'Pet Grooming',
  'Christchurch, NZ',
  55.00,
  95.00,
  'Mobile Paws NZ',
  'Pet Business',
  'bookings@mobilepaws.co.nz',
  4.6,
  78,
  true
),
(
  'Veterinary Nurse Home Visits',
  'Qualified veterinary nurse providing in-home care services. Medication administration, wound care, and post-surgery monitoring.',
  'Veterinary Care',
  'Adelaide, AU',
  35.00,
  75.00,
  'Lisa Thompson',
          'Veterinarian',
  'lisa@homevetcare.com.au',
  4.8,
  134,
  true
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_provider_listings_updated_at 
    BEFORE UPDATE ON provider_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();