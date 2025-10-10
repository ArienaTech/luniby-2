-- Create tables for Veterinarian Dashboard
-- Run this in your Supabase SQL Editor
-- Project: wagrmmbkukwblfpfxxcb

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  species VARCHAR(100) NOT NULL,
  breed VARCHAR(255),
  age DECIMAL(4,1), -- Allows for 0.1 year precision
  weight DECIMAL(6,2), -- Allows for 0.01 kg precision
  owner_name VARCHAR(255) NOT NULL,
  owner_phone VARCHAR(50) NOT NULL,
  owner_email VARCHAR(255),
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create procedures table
CREATE TABLE IF NOT EXISTS procedures (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  procedure_type VARCHAR(255) NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_duration INTEGER, -- Duration in minutes
  notes TEXT,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_provider_id ON patients(provider_id);
CREATE INDEX IF NOT EXISTS idx_patients_species ON patients(species);
CREATE INDEX IF NOT EXISTS idx_procedures_provider_id ON procedures(provider_id);
CREATE INDEX IF NOT EXISTS idx_procedures_patient_id ON procedures(patient_id);
CREATE INDEX IF NOT EXISTS idx_procedures_scheduled_date ON procedures(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_procedures_status ON procedures(status);

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients
CREATE POLICY "Providers can manage their own patients" ON patients
  FOR ALL USING (provider_id = auth.uid());

CREATE POLICY "Providers can view their own patients" ON patients
  FOR SELECT USING (provider_id = auth.uid());

-- Create RLS policies for procedures
CREATE POLICY "Providers can manage their own procedures" ON procedures
  FOR ALL USING (provider_id = auth.uid());

CREATE POLICY "Providers can view their own procedures" ON procedures
  FOR SELECT USING (provider_id = auth.uid());

-- Add some sample data for testing (optional)
-- Uncomment these lines if you want to add sample data

/*
INSERT INTO patients (provider_id, name, species, breed, age, weight, owner_name, owner_phone, owner_email, medical_history) VALUES
(1, 'Max', 'Dog', 'Golden Retriever', 3.5, 28.5, 'John Smith', '+1 234 567 8900', 'john@example.com', 'No known allergies. Up to date on vaccinations.'),
(1, 'Luna', 'Cat', 'Persian', 2.0, 4.2, 'Sarah Johnson', '+1 234 567 8901', 'sarah@example.com', 'Sensitive to certain foods. Regular dental checkups needed.'),
(1, 'Buddy', 'Dog', 'Labrador', 5.0, 32.0, 'Mike Chen', '+1 234 567 8902', 'mike@example.com', 'History of hip dysplasia. Requires joint supplements.');

INSERT INTO procedures (provider_id, patient_id, procedure_type, scheduled_date, estimated_duration, notes, status) VALUES
(1, 1, 'Annual Checkup', NOW() + INTERVAL '1 day', 30, 'Routine wellness exam and vaccinations', 'scheduled'),
(1, 2, 'Dental Cleaning', NOW() + INTERVAL '3 days', 60, 'Full dental cleaning and examination', 'scheduled'),
(1, 3, 'Hip X-Ray', NOW() + INTERVAL '1 week', 45, 'Follow-up hip examination', 'scheduled');
*/

-- Verify tables were created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('patients', 'procedures')
ORDER BY table_name, ordinal_position;