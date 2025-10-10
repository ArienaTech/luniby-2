-- Fix Cases Table Foreign Key Relationships
-- This script adds the missing foreign key constraints that CaseManager expects

-- First, check the current structure of the cases table
-- You can see what columns exist by running: \d cases in psql

-- Add foreign key constraint from cases.customer_id to profiles.id
-- This creates the relationship that CaseManager expects as 'cases_customer_id_fkey'
DO $$ 
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cases_customer_id_fkey' 
        AND table_name = 'cases'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.cases 
        ADD CONSTRAINT cases_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES public.profiles(id);
        
        RAISE NOTICE 'Added foreign key constraint: cases_customer_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint cases_customer_id_fkey already exists';
    END IF;
END $$;

-- Add foreign key constraint from cases.assigned_nurse_id to profiles.id
-- This ensures nurses are valid profile entries
DO $$ 
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cases_assigned_nurse_id_fkey' 
        AND table_name = 'cases'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.cases 
        ADD CONSTRAINT cases_assigned_nurse_id_fkey 
        FOREIGN KEY (assigned_nurse_id) REFERENCES public.profiles(id);
        
        RAISE NOTICE 'Added foreign key constraint: cases_assigned_nurse_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint cases_assigned_nurse_id_fkey already exists';
    END IF;
END $$;

-- Verify the constraints were added
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'cases'
    AND tc.table_schema = 'public';