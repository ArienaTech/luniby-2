-- Create consultation_bookings table for online vet consultations
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  
  -- Consultation details
  consultation_type TEXT NOT NULL CHECK (consultation_type IN (
    'general', 'follow_up', 'prescription', 'nutrition', 'behavior', 'second_opinion'
  )),
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  actual_date DATE,
  actual_time TEXT,
  
  -- Pet information
  pet_name TEXT NOT NULL,
  pet_age INTEGER NOT NULL CHECK (pet_age >= 0 AND pet_age <= 30),
  pet_species TEXT NOT NULL CHECK (pet_species IN (
    'Dog', 'Cat', 'Bird', 'Rabbit', 'Guinea Pig', 'Hamster', 'Fish', 'Reptile', 'Other'
  )),
  
  -- Consultation details
  consultation_reason TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'priority', 'urgent')),
  additional_notes TEXT,
  
  -- Customer information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Booking status and payment
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'refunded', 'failed'
  )),
  
  -- Meeting details (populated when consultation is confirmed)
  meeting_link TEXT,
  meeting_id TEXT,
  meeting_password TEXT,
  
  -- Consultation notes (filled by provider after consultation)
  provider_notes TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_provider_id ON consultation_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_service_id ON consultation_bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_preferred_date ON consultation_bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_customer_email ON consultation_bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_created_at ON consultation_bookings(created_at DESC);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_consultation_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_consultation_bookings_updated_at ON consultation_bookings;
CREATE TRIGGER update_consultation_bookings_updated_at
  BEFORE UPDATE ON consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_bookings_updated_at();

-- Enable Row Level Security
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for consultation bookings
-- Providers can see their own bookings
CREATE POLICY "Providers can view their own consultation bookings" ON consultation_bookings
FOR SELECT USING (
  provider_id IN (
    SELECT id FROM providers WHERE email = auth.jwt() ->> 'email'
  )
);

-- Providers can update their own bookings
CREATE POLICY "Providers can update their own consultation bookings" ON consultation_bookings
FOR UPDATE USING (
  provider_id IN (
    SELECT id FROM providers WHERE email = auth.jwt() ->> 'email'
  )
);

-- Allow public to insert consultation bookings (for booking form)
CREATE POLICY "Allow public to create consultation bookings" ON consultation_bookings
FOR INSERT WITH CHECK (true);

-- Allow public to view their own bookings by email
CREATE POLICY "Allow customers to view their own bookings" ON consultation_bookings
FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

-- Add comments for documentation
COMMENT ON TABLE consultation_bookings IS 'Stores online veterinary consultation bookings';
COMMENT ON COLUMN consultation_bookings.consultation_type IS 'Type of consultation: general, follow_up, prescription, nutrition, behavior, second_opinion';
COMMENT ON COLUMN consultation_bookings.urgency IS 'Urgency level: routine (1-2 weeks), priority (2-3 days), urgent (24 hours)';
COMMENT ON COLUMN consultation_bookings.status IS 'Booking status: pending, confirmed, in_progress, completed, cancelled, no_show';
COMMENT ON COLUMN consultation_bookings.meeting_link IS 'Video call link (Zoom, Google Meet, etc.) populated when confirmed';
COMMENT ON COLUMN consultation_bookings.provider_notes IS 'Notes taken by provider during consultation';

-- Grant appropriate permissions
GRANT SELECT, INSERT ON consultation_bookings TO anon;
GRANT ALL ON consultation_bookings TO authenticated;