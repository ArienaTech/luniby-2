-- Case Management System Migration
-- Creates tables and functions for veterinarian case tracking and workflow management

-- Create case status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status') THEN
        CREATE TYPE case_status AS ENUM (
            'new',
            'assigned',
            'in_review',
            'completed',
            'escalated',
            'cancelled'
        );
    END IF;
END $$;

-- Create case priority enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_priority') THEN
        CREATE TYPE case_priority AS ENUM (
            'urgent',
            'high',
            'normal',
            'low'
        );
    END IF;
END $$;

-- Create case type enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_type') THEN
        CREATE TYPE case_type AS ENUM (
            'triage_review',
            'soap_note',
            'consultation',
            'follow_up'
        );
    END IF;
END $$;

-- Main cases table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Case details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    case_type case_type NOT NULL DEFAULT 'triage_review',
    status case_status NOT NULL DEFAULT 'new',
    priority case_priority NOT NULL DEFAULT 'normal',
    
    -- Relationships
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    pet_id UUID, -- Reference to pet (when pet management is implemented)
    assigned_nurse_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    escalated_to_vet_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Booking relationship (if case comes from a booking)
    booking_id UUID REFERENCES consultation_bookings(id) ON DELETE SET NULL,
    
    -- Triage data (JSON for flexibility)
    triage_data JSONB,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    
    -- Metrics
    response_time_minutes INTEGER,
    resolution_time_minutes INTEGER,
    
    -- Metadata
    tags TEXT[],
    external_reference VARCHAR(100)
);

-- Case notes table for internal documentation
CREATE TABLE IF NOT EXISTS case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    note_type VARCHAR(50) NOT NULL DEFAULT 'general', -- general, internal, escalation, follow_up
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    attachments JSONB, -- For future file attachments
    mentioned_users UUID[] -- For @mentions
);

-- SOAP notes table
CREATE TABLE IF NOT EXISTS soap_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- SOAP sections
    subjective TEXT, -- What the owner reports
    objective TEXT,  -- What the nurse observes
    assessment TEXT, -- Professional assessment
    plan TEXT,       -- Recommended plan
    
    -- Additional fields
    vital_signs JSONB,
    medications JSONB,
    recommendations TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    
    -- Status and approval
    status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, approved, rejected
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Digital signature (for future implementation)
    signature_data JSONB
);

-- Case status history for audit trail
CREATE TABLE IF NOT EXISTS case_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    
    old_status case_status,
    new_status case_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    change_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case assignments table for tracking workload
CREATE TABLE IF NOT EXISTS case_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    nurse_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    unassigned_at TIMESTAMP WITH TIME ZONE,
    unassigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    is_active BOOLEAN DEFAULT true,
    assignment_reason TEXT
);

-- Veterinarian metrics table
CREATE TABLE IF NOT EXISTS vet_nurse_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nurse_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Date for daily metrics
    metric_date DATE NOT NULL,
    
    -- Case metrics
    cases_assigned INTEGER DEFAULT 0,
    cases_completed INTEGER DEFAULT 0,
    cases_escalated INTEGER DEFAULT 0,
    
    -- Time metrics (in minutes)
    avg_response_time INTEGER,
    avg_resolution_time INTEGER,
    total_active_time INTEGER,
    
    -- Quality metrics
    customer_satisfaction_score DECIMAL(3,2),
    peer_review_score DECIMAL(3,2),
    
    -- Workload metrics
    peak_concurrent_cases INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(nurse_id, metric_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_nurse ON cases(assigned_nurse_id);
CREATE INDEX IF NOT EXISTS idx_cases_customer ON cases(customer_id);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);
CREATE INDEX IF NOT EXISTS idx_cases_due_date ON cases(due_date);

CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON case_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_author ON case_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_created_at ON case_notes(created_at);

CREATE INDEX IF NOT EXISTS idx_soap_notes_case_id ON soap_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_author ON soap_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_status ON soap_notes(status);

CREATE INDEX IF NOT EXISTS idx_case_assignments_nurse ON case_assignments(nurse_id);
CREATE INDEX IF NOT EXISTS idx_case_assignments_active ON case_assignments(is_active);

CREATE INDEX IF NOT EXISTS idx_vet_nurse_metrics_nurse_date ON vet_nurse_metrics(nurse_id, metric_date);

-- Create function to generate case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    case_number TEXT;
    year_part TEXT;
    sequence_num INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YY');
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 3) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM cases
    WHERE case_number LIKE year_part || '%';
    
    case_number := year_part || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN case_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-assign case number
CREATE OR REPLACE FUNCTION auto_assign_case_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
        NEW.case_number := generate_case_number();
    END IF;
    
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for case number assignment
DROP TRIGGER IF EXISTS trigger_auto_assign_case_number ON cases;
CREATE TRIGGER trigger_auto_assign_case_number
    BEFORE INSERT ON cases
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_case_number();

-- Create function to track status changes
CREATE OR REPLACE FUNCTION track_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only track if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO case_status_history (case_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.assigned_nurse_id);
        
        -- Update timing fields based on status
        IF NEW.status = 'assigned' AND OLD.status = 'new' THEN
            NEW.assigned_at := NOW();
        ELSIF NEW.status = 'in_review' AND OLD.status IN ('new', 'assigned') THEN
            NEW.started_at := NOW();
        ELSIF NEW.status = 'completed' AND OLD.status != 'completed' THEN
            NEW.completed_at := NOW();
            -- Calculate resolution time
            IF NEW.started_at IS NOT NULL THEN
                NEW.resolution_time_minutes := EXTRACT(EPOCH FROM (NOW() - NEW.started_at)) / 60;
            END IF;
        END IF;
    END IF;
    
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status change tracking
DROP TRIGGER IF EXISTS trigger_track_case_status_change ON cases;
CREATE TRIGGER trigger_track_case_status_change
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION track_case_status_change();

-- Create function to validate nurse and vet assignments
CREATE OR REPLACE FUNCTION validate_case_assignments()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate assigned nurse is a provider
    IF NEW.assigned_nurse_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.assigned_nurse_id AND role = 'provider') THEN
            RAISE EXCEPTION 'Assigned nurse must be a provider';
        END IF;
    END IF;
    
    -- Validate escalated vet is a provider
    IF NEW.escalated_to_vet_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.escalated_to_vet_id AND role = 'provider') THEN
            RAISE EXCEPTION 'Escalated vet must be a provider';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assignment validation
DROP TRIGGER IF EXISTS trigger_validate_case_assignments ON cases;
CREATE TRIGGER trigger_validate_case_assignments
    BEFORE INSERT OR UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION validate_case_assignments();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS trigger_case_notes_updated_at ON case_notes;
CREATE TRIGGER trigger_case_notes_updated_at
    BEFORE UPDATE ON case_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_soap_notes_updated_at ON soap_notes;
CREATE TRIGGER trigger_soap_notes_updated_at
    BEFORE UPDATE ON soap_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_nurse_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Cases: Customers can see their own cases, providers can see assigned cases
CREATE POLICY "Users can view their own cases" ON cases
    FOR SELECT USING (
        customer_id = auth.uid() OR 
        assigned_nurse_id = auth.uid() OR 
        escalated_to_vet_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
    );

CREATE POLICY "Providers can update assigned cases" ON cases
    FOR UPDATE USING (
        assigned_nurse_id = auth.uid() OR 
        escalated_to_vet_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
    );

CREATE POLICY "Providers can create cases" ON cases
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('provider', 'admin', 'support'))
    );

-- Case notes: Only case participants can see notes
CREATE POLICY "Case participants can view notes" ON case_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cases c 
            WHERE c.id = case_id AND (
                c.customer_id = auth.uid() OR 
                c.assigned_nurse_id = auth.uid() OR 
                c.escalated_to_vet_id = auth.uid() OR
                author_id = auth.uid()
            )
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
    );

CREATE POLICY "Providers can create case notes" ON case_notes
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('provider', 'admin', 'support'))
    );

-- SOAP notes: Similar to case notes
CREATE POLICY "Case participants can view SOAP notes" ON soap_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cases c 
            WHERE c.id = case_id AND (
                c.customer_id = auth.uid() OR 
                c.assigned_nurse_id = auth.uid() OR 
                c.escalated_to_vet_id = auth.uid() OR
                author_id = auth.uid()
            )
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
    );

CREATE POLICY "Providers can manage SOAP notes" ON soap_notes
    FOR ALL USING (
        author_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
    );

-- Case status history: Read-only for case participants
CREATE POLICY "Case participants can view status history" ON case_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cases c 
            WHERE c.id = case_id AND (
                c.customer_id = auth.uid() OR 
                c.assigned_nurse_id = auth.uid() OR 
                c.escalated_to_vet_id = auth.uid()
            )
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
    );

-- Case assignments: Providers can see their assignments
CREATE POLICY "Providers can view case assignments" ON case_assignments
    FOR SELECT USING (
        nurse_id = auth.uid() OR
        assigned_by = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
    );

-- Veterinarian metrics: Veterinarians can see their own metrics
CREATE POLICY "Nurses can view own metrics" ON vet_nurse_metrics
    FOR SELECT USING (
        nurse_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
    );

CREATE POLICY "System can update metrics" ON vet_nurse_metrics
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('provider', 'admin', 'support'))
    );

-- Grant permissions
GRANT ALL ON cases TO authenticated;
GRANT ALL ON case_notes TO authenticated;
GRANT ALL ON soap_notes TO authenticated;
GRANT ALL ON case_status_history TO authenticated;
GRANT ALL ON case_assignments TO authenticated;
GRANT ALL ON vet_nurse_metrics TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

SELECT 'Case management system created successfully!' as status;