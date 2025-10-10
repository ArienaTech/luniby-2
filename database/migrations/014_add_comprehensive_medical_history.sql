-- Add Comprehensive Medical History for Pets
-- This migration enhances the pets table and creates supporting tables for medical history

-- First, add medical history fields to the existing pets table
ALTER TABLE pets ADD COLUMN IF NOT EXISTS medical_history JSONB DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS current_medications JSONB DEFAULT '[]';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS vaccination_status JSONB DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS chronic_conditions JSONB DEFAULT '[]';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS previous_surgeries JSONB DEFAULT '[]';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS behavioral_notes TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS dietary_restrictions JSONB DEFAULT '[]';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '[]';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS preferred_vet JSONB DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_checkup_date DATE;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS medical_alerts JSONB DEFAULT '[]';

-- Create medical_timeline table for tracking medical events chronologically
CREATE TABLE IF NOT EXISTS medical_timeline (
  id BIGSERIAL PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'vaccination', 'medication', 'surgery', 'diagnosis', 'checkup', 'emergency', 'luni_triage'
  event_date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  vet_name VARCHAR(255),
  clinic_name VARCHAR(255),
  cost DECIMAL(10,2),
  severity VARCHAR(20), -- 'low', 'moderate', 'high', 'emergency'
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}', -- For storing additional structured data
  source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'luni_triage', 'import', 'api'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_timeline_pet_id ON medical_timeline(pet_id);
CREATE INDEX IF NOT EXISTS idx_medical_timeline_owner_id ON medical_timeline(owner_id);
CREATE INDEX IF NOT EXISTS idx_medical_timeline_event_type ON medical_timeline(event_type);
CREATE INDEX IF NOT EXISTS idx_medical_timeline_event_date ON medical_timeline(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_timeline_source ON medical_timeline(source);

-- Create medical_conditions table for standardized condition tracking
CREATE TABLE IF NOT EXISTS medical_conditions (
  id BIGSERIAL PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condition_name VARCHAR(255) NOT NULL,
  condition_type VARCHAR(50) NOT NULL, -- 'chronic', 'acute', 'genetic', 'behavioral'
  severity VARCHAR(20) DEFAULT 'moderate', -- 'mild', 'moderate', 'severe'
  diagnosed_date DATE,
  diagnosed_by VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'managed', 'monitoring'
  treatment_plan TEXT,
  medications JSONB DEFAULT '[]',
  notes TEXT,
  last_flare_up DATE,
  is_hereditary BOOLEAN DEFAULT FALSE,
  affects_anesthesia BOOLEAN DEFAULT FALSE,
  emergency_protocol TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for medical conditions
CREATE INDEX IF NOT EXISTS idx_medical_conditions_pet_id ON medical_conditions(pet_id);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_owner_id ON medical_conditions(owner_id);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_status ON medical_conditions(status);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_type ON medical_conditions(condition_type);

-- Create current_medications table for detailed medication tracking
CREATE TABLE IF NOT EXISTS current_medications (
  id BIGSERIAL PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  route VARCHAR(50), -- 'oral', 'topical', 'injection', 'inhalation'
  start_date DATE NOT NULL,
  end_date DATE,
  prescribed_by VARCHAR(255),
  prescription_number VARCHAR(100),
  indication TEXT, -- What condition this treats
  side_effects_to_watch JSONB DEFAULT '[]',
  food_interactions JSONB DEFAULT '[]',
  drug_interactions JSONB DEFAULT '[]',
  special_instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  refills_remaining INTEGER,
  last_refill_date DATE,
  next_refill_due DATE,
  cost_per_refill DECIMAL(8,2),
  pharmacy_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for medications
CREATE INDEX IF NOT EXISTS idx_current_medications_pet_id ON current_medications(pet_id);
CREATE INDEX IF NOT EXISTS idx_current_medications_owner_id ON current_medications(owner_id);
CREATE INDEX IF NOT EXISTS idx_current_medications_active ON current_medications(is_active);
CREATE INDEX IF NOT EXISTS idx_current_medications_end_date ON current_medications(end_date);

-- Enable Row Level Security on new tables
ALTER TABLE medical_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_medications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for medical_timeline
CREATE POLICY "Users can read their pets' medical timeline" ON medical_timeline
FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their pets' medical timeline" ON medical_timeline
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their pets' medical timeline" ON medical_timeline
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their pets' medical timeline" ON medical_timeline
FOR DELETE USING (owner_id = auth.uid());

-- Create RLS policies for medical_conditions
CREATE POLICY "Users can read their pets' medical conditions" ON medical_conditions
FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their pets' medical conditions" ON medical_conditions
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their pets' medical conditions" ON medical_conditions
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their pets' medical conditions" ON medical_conditions
FOR DELETE USING (owner_id = auth.uid());

-- Create RLS policies for current_medications
CREATE POLICY "Users can read their pets' medications" ON current_medications
FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their pets' medications" ON current_medications
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their pets' medications" ON current_medications
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their pets' medications" ON current_medications
FOR DELETE USING (owner_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_medical_timeline_updated_at 
    BEFORE UPDATE ON medical_timeline 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_conditions_updated_at 
    BEFORE UPDATE ON medical_conditions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_current_medications_updated_at 
    BEFORE UPDATE ON current_medications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get comprehensive medical summary for triage
CREATE OR REPLACE FUNCTION get_pet_medical_summary(pet_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    pet_info RECORD;
    conditions JSONB;
    medications JSONB;
    recent_timeline JSONB;
    allergies TEXT[];
    special_needs TEXT;
BEGIN
    -- Get basic pet info
    SELECT 
        name, species, breed, gender, birth_date, weight, 
        allergies, special_needs, medical_history, vaccination_status,
        chronic_conditions, behavioral_notes, dietary_restrictions,
        medical_alerts, last_checkup_date, preferred_vet
    INTO pet_info
    FROM pets 
    WHERE id = pet_uuid;

    -- Get active medical conditions
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'condition', condition_name,
            'type', condition_type,
            'severity', severity,
            'status', status,
            'diagnosed_date', diagnosed_date,
            'affects_anesthesia', affects_anesthesia,
            'emergency_protocol', emergency_protocol
        )
    ), '[]'::jsonb)
    INTO conditions
    FROM medical_conditions
    WHERE pet_id = pet_uuid AND status IN ('active', 'managed');

    -- Get active medications
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'name', medication_name,
            'dosage', dosage,
            'frequency', frequency,
            'indication', indication,
            'side_effects', side_effects_to_watch,
            'interactions', drug_interactions
        )
    ), '[]'::jsonb)
    INTO medications
    FROM current_medications
    WHERE pet_id = pet_uuid AND is_active = true;

    -- Get recent medical timeline (last 6 months)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'date', event_date,
            'type', event_type,
            'title', title,
            'severity', severity,
            'description', description,
            'source', source
        )
        ORDER BY event_date DESC
    ), '[]'::jsonb)
    INTO recent_timeline
    FROM medical_timeline
    WHERE pet_id = pet_uuid 
    AND event_date >= CURRENT_DATE - INTERVAL '6 months'
    LIMIT 10;

    -- Build comprehensive summary
    result := jsonb_build_object(
        'pet_info', jsonb_build_object(
            'name', pet_info.name,
            'species', pet_info.species,
            'breed', pet_info.breed,
            'age_months', EXTRACT(YEAR FROM AGE(CURRENT_DATE, pet_info.birth_date)) * 12 + 
                         EXTRACT(MONTH FROM AGE(CURRENT_DATE, pet_info.birth_date)),
            'weight', pet_info.weight,
            'last_checkup', pet_info.last_checkup_date
        ),
        'medical_alerts', pet_info.medical_alerts,
        'allergies', pet_info.allergies,
        'special_needs', pet_info.special_needs,
        'behavioral_notes', pet_info.behavioral_notes,
        'dietary_restrictions', pet_info.dietary_restrictions,
        'vaccination_status', pet_info.vaccination_status,
        'chronic_conditions', pet_info.chronic_conditions,
        'active_conditions', conditions,
        'current_medications', medications,
        'recent_timeline', recent_timeline,
        'preferred_vet', pet_info.preferred_vet,
        'summary_generated_at', CURRENT_TIMESTAMP
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add Luni Triage assessment to medical timeline
CREATE OR REPLACE FUNCTION add_luni_triage_to_timeline(
    pet_uuid UUID,
    owner_uuid UUID,
    assessment_title TEXT,
    assessment_description TEXT,
    severity_level TEXT,
    triage_metadata JSONB DEFAULT '{}'
)
RETURNS BIGINT AS $$
DECLARE
    timeline_id BIGINT;
BEGIN
    INSERT INTO medical_timeline (
        pet_id,
        owner_id,
        event_type,
        event_date,
        title,
        description,
        severity,
        source,
        metadata
    ) VALUES (
        pet_uuid,
        owner_uuid,
        'luni_triage',
        CURRENT_DATE,
        assessment_title,
        assessment_description,
        LOWER(severity_level),
        'luni_triage',
        triage_metadata
    ) RETURNING id INTO timeline_id;

    RETURN timeline_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some example data structure for medical history
COMMENT ON TABLE medical_timeline IS 'Chronological timeline of all medical events for pets';
COMMENT ON TABLE medical_conditions IS 'Current and historical medical conditions for pets';
COMMENT ON TABLE current_medications IS 'Detailed tracking of current medications';

COMMENT ON FUNCTION get_pet_medical_summary(UUID) IS 'Returns comprehensive medical summary for Luni Triage integration';
COMMENT ON FUNCTION add_luni_triage_to_timeline(UUID, UUID, TEXT, TEXT, TEXT, JSONB) IS 'Adds Luni Triage assessment to pet medical timeline';