-- Fix for ambiguous case_number column reference
-- Run this in Supabase SQL Editor to fix the case number generation

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    new_case_number TEXT;
    year_part TEXT;
    sequence_num INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YY');
    
    -- Get next sequence number for this year (fixed column reference)
    SELECT COALESCE(MAX(CAST(SUBSTRING(cases.case_number FROM 3) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM cases
    WHERE cases.case_number LIKE year_part || '%';
    
    new_case_number := year_part || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN new_case_number;
END;
$$ LANGUAGE plpgsql;

SELECT 'Case number function fixed!' as status;